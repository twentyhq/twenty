import { Inject, Injectable, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { WORKFLOW_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-tool-service.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import type { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class WorkflowToolProvider implements ToolProvider {
  readonly category = ToolCategory.WORKFLOW;

  constructor(
    @Optional()
    @Inject(WORKFLOW_TOOL_SERVICE_TOKEN)
    private readonly workflowToolService: WorkflowToolWorkspaceService | null,
    private readonly permissionsService: PermissionsService,
  ) {}

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

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    if (!this.workflowToolService) {
      return {};
    }

    return this.workflowToolService.generateWorkflowTools(
      context.workspaceId,
      context.rolePermissionConfig,
    );
  }
}
