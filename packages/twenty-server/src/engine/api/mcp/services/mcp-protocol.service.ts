import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { type ToolSet, zodSchema } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';
import { MCP_SERVER_INSTRUCTIONS } from 'src/engine/api/mcp/constants/mcp-server-instructions.const';
import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  EXECUTE_TOOL_TOOL_NAME,
  executeToolInputSchema,
} from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import {
  createGetToolCatalogTool,
  GET_TOOL_CATALOG_TOOL_NAME,
  getToolCatalogInputSchema,
} from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';
import {
  createLearnToolsTool,
  LEARN_TOOLS_TOOL_NAME,
  learnToolsInputSchema,
} from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import {
  createLoadSkillTool,
  LOAD_SKILL_TOOL_NAME,
  loadSkillInputSchema,
} from 'src/engine/core-modules/tool-provider/tools/load-skill.tool';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

const MCP_EXCLUDED_TOOLS = new Set(['code_interpreter', 'http_request']);

@Injectable()
export class McpProtocolService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly skillService: SkillService,
  ) {}

  handleInitialize(requestId: string | number) {
    return wrapJsonRpcResponse(requestId, {
      result: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
        serverInfo: MCP_SERVER_INFO,
        instructions: MCP_SERVER_INSTRUCTIONS,
      },
    });
  }

  async getRoleId(
    workspaceId: string,
    userWorkspaceId?: string,
    apiKey?: FlatApiKey,
  ) {
    if (isDefined(apiKey)) {
      return this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKey.id,
        workspaceId,
      );
    }

    if (!userWorkspaceId) {
      throw new HttpException(
        'User workspace ID missing',
        HttpStatus.FORBIDDEN,
      );
    }

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    if (!roleId) {
      throw new HttpException('Role ID missing', HttpStatus.FORBIDDEN);
    }

    return roleId;
  }

  private async buildMcpToolSet(
    workspace: FlatWorkspace,
    roleId: string,
    options?: {
      authContext?: WorkspaceAuthContext;
      userId?: string;
      userWorkspaceId?: string;
    },
  ): Promise<ToolSet> {
    const toolContext = {
      workspaceId: workspace.id,
      roleId,
      authContext: options?.authContext,
      userId: options?.userId,
      userWorkspaceId: options?.userWorkspaceId,
    };

    const preloadedTools = await this.toolRegistry.getToolsByName(
      COMMON_PRELOAD_TOOLS,
      toolContext,
    );

    return {
      ...preloadedTools,
      [GET_TOOL_CATALOG_TOOL_NAME]: {
        ...createGetToolCatalogTool(this.toolRegistry, workspace.id, roleId, {
          userId: options?.userId,
          userWorkspaceId: options?.userWorkspaceId,
          excludeTools: MCP_EXCLUDED_TOOLS,
        }),
        inputSchema: zodSchema(getToolCatalogInputSchema),
      },
      [LEARN_TOOLS_TOOL_NAME]: {
        ...createLearnToolsTool(
          this.toolRegistry,
          toolContext,
          MCP_EXCLUDED_TOOLS,
        ),
        inputSchema: zodSchema(learnToolsInputSchema),
      },
      [EXECUTE_TOOL_TOOL_NAME]: {
        ...createExecuteToolTool(
          this.toolRegistry,
          toolContext,
          preloadedTools,
          MCP_EXCLUDED_TOOLS,
        ),
        inputSchema: executeToolInputSchema,
      },
      [LOAD_SKILL_TOOL_NAME]: {
        ...createLoadSkillTool(
          (names) =>
            this.skillService.findFlatSkillsByNames(names, workspace.id),
          async () => {
            const allSkills = await this.skillService.findAllFlatSkills(
              workspace.id,
            );

            return allSkills.map((skill) => skill.name);
          },
        ),
        inputSchema: zodSchema(loadSkillInputSchema),
      },
    };
  }

  // Returns null for JSON-RPC notifications (no id), which require no response body
  async handleMCPCoreQuery(
    { id, method, params }: JsonRpc,
    {
      workspace,
      userId,
      userWorkspaceId,
      apiKey,
    }: {
      workspace: FlatWorkspace;
      userId?: string;
      userWorkspaceId?: string;
      apiKey: FlatApiKey | undefined;
    },
    sseWriter?: (data: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown> | null> {
    try {
      // JSON-RPC notifications have no id and expect no response
      if (!isDefined(id)) {
        return null;
      }

      if (method === 'initialize') {
        return this.handleInitialize(id);
      }

      if (method === 'ping') {
        return wrapJsonRpcResponse(id, { result: {} });
      }

      if (method === 'prompts/list') {
        return wrapJsonRpcResponse(id, {
          result: { prompts: [] },
        });
      }

      if (method === 'resources/list') {
        return wrapJsonRpcResponse(id, {
          result: { resources: [] },
        });
      }

      if (method !== 'tools/list' && method !== 'tools/call') {
        return wrapJsonRpcResponse(id, {
          error: {
            code: JSON_RPC_ERROR_CODE.METHOD_NOT_FOUND,
            message: `Method '${method}' not found`,
          },
        });
      }

      const roleId = await this.getRoleId(
        workspace.id,
        userWorkspaceId,
        apiKey,
      );

      const authContext = isDefined(apiKey)
        ? buildApiKeyAuthContext({ workspace, apiKey })
        : undefined;

      const toolSet = await this.buildMcpToolSet(workspace, roleId, {
        authContext,
        userId,
        userWorkspaceId,
      });

      if (method === 'tools/call') {
        if (!params) {
          return wrapJsonRpcResponse(id, {
            error: {
              code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
              message: 'tools/call requires params with name and arguments',
            },
          });
        }

        return await this.mcpToolExecutorService.handleToolCall(
          id,
          toolSet,
          params,
          sseWriter,
        );
      }

      return this.mcpToolExecutorService.handleToolsListing(id, toolSet);
    } catch (error) {
      if (error instanceof HttpException) {
        return wrapJsonRpcResponse(id ?? 0, {
          error: {
            code: JSON_RPC_ERROR_CODE.SERVER_ERROR,
            message: error.message || 'Request failed',
          },
        });
      }

      return wrapJsonRpcResponse(id ?? 0, {
        error: {
          code: JSON_RPC_ERROR_CODE.INTERNAL_ERROR,
          message:
            error instanceof Error ? error.message : 'Internal server error',
        },
      });
    }
  }
}
