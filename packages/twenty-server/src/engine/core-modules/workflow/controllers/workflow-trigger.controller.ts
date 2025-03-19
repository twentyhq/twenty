import { Controller, Get, Param } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

@Controller('webhooks')
export class WorkflowTriggerController {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Get('workflows/:workspaceId/:workflowId')
  async runWorkflow(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string,
  ) {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowId },
    });

    if (!isDefined(workflow?.lastPublishedVersionId)) {
      throw new Error('Workflow not activated');
    }

    return await this.workflowTriggerWorkspaceService.runWorkflowVersion({
      workflowVersionId: workflow.lastPublishedVersionId,
      payload: {},
      createdBy: {
        source: FieldActorSource.WEBHOOK,
        workspaceMemberId: null,
        name: '',
        context: {},
      },
    });
  }
}
