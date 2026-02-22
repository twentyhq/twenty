import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { type ToolSet, zodSchema } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

const MCP_EXCLUDED_TOOLS = new Set(['code_interpreter', 'http_request']);

@Injectable()
export class McpProtocolService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly skillService: SkillService,
  ) {}

  async checkAiEnabled(workspaceId: string): Promise<void> {
    const isAiEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_ENABLED,
      workspaceId,
    );

    if (!isAiEnabled) {
      throw new HttpException(
        'AI feature is not enabled for this workspace',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  handleInitialize(requestId: string | number) {
    return wrapJsonRpcResponse(requestId, {
      result: {
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
        tools: [],
        resources: [],
        prompts: [],
      },
    });
  }

  async getRoleId(
    workspaceId: string,
    userWorkspaceId?: string,
    apiKey?: ApiKeyEntity,
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
    workspace: WorkspaceEntity,
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
        inputSchema: zodSchema(executeToolInputSchema),
      },
      [LOAD_SKILL_TOOL_NAME]: {
        ...createLoadSkillTool((names) =>
          this.skillService.findFlatSkillsByNames(names, workspace.id),
        ),
        inputSchema: zodSchema(loadSkillInputSchema),
      },
    };
  }

  async handleMCPCoreQuery(
    { id, method, params }: JsonRpc,
    {
      workspace,
      userId,
      userWorkspaceId,
      apiKey,
    }: {
      workspace: WorkspaceEntity;
      userId?: string;
      userWorkspaceId?: string;
      apiKey: ApiKeyEntity | undefined;
    },
  ): Promise<Record<string, unknown>> {
    try {
      await this.checkAiEnabled(workspace.id);

      if (method === 'initialize') {
        return this.handleInitialize(id);
      }

      if (method === 'ping') {
        return wrapJsonRpcResponse(
          id,
          {
            result: {},
          },
          true,
        );
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

      if (method === 'tools/call' && params) {
        return await this.mcpToolExecutorService.handleToolCall(
          id,
          toolSet,
          params,
        );
      }

      if (method === 'tools/list') {
        return this.mcpToolExecutorService.handleToolsListing(id, toolSet);
      }

      if (method === 'prompts/list') {
        return wrapJsonRpcResponse(id, {
          result: {
            capabilities: {
              prompts: { listChanged: false },
            },
            prompts: [],
          },
        });
      }

      if (method === 'resources/list') {
        return wrapJsonRpcResponse(id, {
          result: {
            capabilities: {
              resources: { listChanged: false },
            },
            resources: [],
          },
        });
      }

      return wrapJsonRpcResponse(id, {
        result: {},
      });
    } catch (error) {
      return wrapJsonRpcResponse(id, {
        error: {
          code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to execute tool',
        },
      });
    }
  }
}
