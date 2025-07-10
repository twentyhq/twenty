import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { Repository } from 'typeorm';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { JSONSchema7 } from 'json-schema';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { wrapJsonRpcResponse } from 'src/engine/core-modules/ai/utils/wrap-jsonrpc-response';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { CreateToolsService } from 'src/engine/api/mcp/services/tools/create.tools.service';
import { UpdateToolsService } from 'src/engine/api/mcp/services/tools/update.tools.service';
import { DeleteToolsService } from 'src/engine/api/mcp/services/tools/delete.tools.service';
import { GetToolsService } from 'src/engine/api/mcp/services/tools/get.tools.service';

@Injectable()
export class MCPMetadataService {
  schemas: Record<string, JSONSchema7>;

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly createToolsService: CreateToolsService,
    private readonly updateToolsService: UpdateToolsService,
    private readonly deleteToolsService: DeleteToolsService,
    private readonly getToolsService: GetToolsService,
  ) {}

  async onModuleInit() {
    this.schemas = validationMetadatasToSchemas() as Record<
      string,
      JSONSchema7
    >;
  }

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

  handleInitialize(requestId: string | number | null) {
    return wrapJsonRpcResponse(requestId, {
      result: {
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
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
          label: ADMIN_ROLE_LABEL,
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

  get listTool() {
    return [
      ...this.createToolsService.tools,
      ...this.updateToolsService.tools,
      ...this.deleteToolsService.tools,
      ...this.getToolsService.tools,
    ];
  }

  async handleToolCall(
    request: Request,
  ): Promise<Parameters<typeof wrapJsonRpcResponse>[1]> {
    try {
      const tool = this.listTool.find(
        ({ name }) => name === request.body.params.name,
      );

      if (tool) {
        return {
          result: await tool.execute(request),
        };
      }

      return {
        error: {
          code: HttpStatus.NOT_FOUND,
          message: `Tool ${request.body.params.name} not found`,
        },
      };
    } catch (error) {
      return {
        error: {
          code: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Failed to execute tool',
        },
      };
    }
  }

  async executeTool(
    request: Request,
    {
      workspace,
      userWorkspaceId,
      apiKey,
    }: { workspace: Workspace; userWorkspaceId?: string; apiKey?: string },
  ): Promise<Record<string, unknown>> {
    try {
      await this.checkAiEnabled(workspace.id);

      if (request.body.method === 'initialize') {
        return this.handleInitialize(request.body.id);
      }

      if (request.body.method === 'tools/call' && request.body.params) {
        return wrapJsonRpcResponse(
          request.body.id,
          await this.handleToolCall(request),
        );
      }

      return wrapJsonRpcResponse(request.body.id, {
        result: {
          capabilities: {
            tools: { listChanged: false },
          },
          tools: Object.values(this.listTool),
        },
      });
    } catch (error) {
      return wrapJsonRpcResponse(request.body.id, {
        error: {
          code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to execute tool',
        },
      });
    }
  }
}
