import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolProviderService } from 'src/engine/core-modules/tool-provider/services/tool-provider.service';
import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

@Injectable()
export class McpProtocolService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly toolProvider: ToolProviderService,
    private readonly userRoleService: UserRoleService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
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
      const [role] = await this.roleRepository.find({
        where: {
          workspaceId,
          standardId: ADMIN_ROLE.standardId,
        },
      });

      if (!isDefined(role)) {
        throw new HttpException('Admin role not found', HttpStatus.FORBIDDEN);
      }

      return role.id;
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

      const toolSet = await this.toolProvider.getTools({
        workspaceId: workspace.id,
        categories: [ToolCategory.DATABASE_CRUD, ToolCategory.ACTION],
        rolePermissionConfig: { unionOf: [roleId] },
        wrapWithErrorContext: false,
        // Exclude code_interpreter from MCP to prevent recursive execution attacks
        // (code running in the sandbox could call code_interpreter via MCP)
        excludeTools: [ToolType.CODE_INTERPRETER],
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
