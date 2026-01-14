import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class McpProtocolService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
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

  private buildAuthContext(
    workspace: WorkspaceEntity,
    userWorkspaceId?: string,
    apiKey?: ApiKeyEntity,
  ): WorkspaceAuthContext {
    return {
      user: null,
      apiKey: apiKey ?? null,
      application: null,
      workspace,
      workspaceMemberId: undefined,
      userWorkspaceId: userWorkspaceId ?? undefined,
    } as WorkspaceAuthContext;
  }

  async handleMCPCoreQuery(
    { id, method, params }: JsonRpc,
    {
      workspace,
      userWorkspaceId,
      apiKey,
    }: {
      workspace: WorkspaceEntity;
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

      const authContext = this.buildAuthContext(
        workspace,
        userWorkspaceId,
        apiKey,
      );

      // Exclude code_interpreter from MCP to prevent recursive execution attacks
      // (code running in the sandbox could call code_interpreter via MCP)
      const toolSet = await this.toolRegistry.getToolsByCategories(
        {
          workspaceId: workspace.id,
          roleId,
          rolePermissionConfig: { unionOf: [roleId] },
          authContext,
          userWorkspaceId,
        },
        {
          categories: [ToolCategory.DATABASE_CRUD, ToolCategory.ACTION],
          excludeTools: [ToolType.CODE_INTERPRETER],
          wrapWithErrorContext: false,
        },
      );

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
