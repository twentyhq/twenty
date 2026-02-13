import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type GenerateDescriptorOptions,
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { WORKFLOW_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-tool-service.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import {
  type ToolDescriptor,
  type ToolIndexEntry,
} from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import type { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class WorkflowToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.WORKFLOW;

  constructor(
    @Optional()
    @Inject(WORKFLOW_TOOL_SERVICE_TOKEN)
    private readonly workflowToolService: WorkflowToolWorkspaceService | null,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    if (this.workflowToolService) {
      const service = this.workflowToolService;

      this.toolExecutorService.registerCategoryGenerator(
        ToolCategory.WORKFLOW,
        async (context) =>
          service.generateWorkflowTools(
            context.workspaceId,
            context.rolePermissionConfig,
          ),
      );
    }
  }

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    if (!this.workflowToolService) {
      return false;
    }

    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.WORKFLOWS,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    if (!this.workflowToolService) {
      return [];
    }

    const toolSet = await this.workflowToolService.generateWorkflowTools(
      context.workspaceId,
      context.rolePermissionConfig,
    );

    return toolSetToDescriptors(toolSet, ToolCategory.WORKFLOW, {
      includeSchemas: options?.includeSchemas ?? true,
    });
  }
}
