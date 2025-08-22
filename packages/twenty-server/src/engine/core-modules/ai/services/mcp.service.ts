import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type JsonRpc } from 'src/engine/core-modules/ai/dtos/json-rpc';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { wrapJsonRpcResponse } from 'src/engine/core-modules/ai/utils/wrap-jsonrpc-response.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ADMIN_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/admin-role';

@Injectable()
export class McpService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly toolService: ToolService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(RoleEntity, 'core')
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
    apiKey?: string,
  ) {
    if (apiKey) {
      const roles = await this.roleRepository.find({
        where: {
          workspaceId,
          standardId: ADMIN_ROLE.standardId,
        },
      });

      if (roles.length === 0) {
        throw new HttpException('Admin role not found', HttpStatus.FORBIDDEN);
      }

      return roles[0].id;
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
    }: { workspace: Workspace; userWorkspaceId?: string; apiKey?: string },
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

      const toolSet = await this.toolService.listTools(roleId, workspace.id);

      if (method === 'tools/call' && params) {
        return await this.handleToolCall(id, toolSet, params);
      }

      if (method === 'tools/list') {
        return await this.handleToolsListing(id, toolSet);
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

  private async handleToolCall(
    id: string | number,
    toolSet: ToolSet,
    params: Record<string, unknown>,
  ) {
    const toolName = params.name as keyof typeof toolSet;
    const tool = toolSet[toolName];

    if (isDefined(tool) && isDefined(tool.execute)) {
      return wrapJsonRpcResponse(id, {
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await tool.execute(params.arguments, {
                  toolCallId: '1',
                  messages: [],
                }),
              ),
            },
          ],
          isError: false,
        },
      });
    }

    throw new HttpException(
      `Tool '${params.name}' not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  private handleToolsListing(id: string | number, toolSet: ToolSet) {
    const toolsArray = Object.entries(toolSet)
      .filter(([, def]) => !!def.parameters.jsonSchema)
      .map(([name, def]) => ({
        name,
        description: def.description,
        inputSchema: def.parameters.jsonSchema,
      }));

    return wrapJsonRpcResponse(id, {
      result: {
        capabilities: {
          tools: { listChanged: false },
        },
        tools: toolsArray,
        resources: [],
        prompts: [],
      },
    });
  }
}
