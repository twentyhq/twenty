import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

@Injectable()
export class CoreWorkflowIdResolutionService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  // Every by-id access goes through here, so this is where a private workflow stops resolving.
  async resolveCoreVersionOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<WorkflowVersionEntity> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersion.id],
      },
    );

    if (isDefined(coreWorkflowVersion.coreWorkflowId)) {
      await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow(
        {
          workspaceId,
          userWorkspaceId,
          coreWorkflowIds: [coreWorkflowVersion.coreWorkflowId],
        },
      );
    }

    return coreWorkflowVersion;
  }

  async resolveCoreWorkflowOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowId: string;
  }): Promise<WorkflowEntity> {
    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowId } },
    );

    if (!isDefined(coreWorkflow)) {
      throw new WorkflowQueryValidationException(
        `Core workflow '${coreWorkflowId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow not found`,
        },
      );
    }

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds: [coreWorkflow.id],
    });

    return coreWorkflow;
  }
}
