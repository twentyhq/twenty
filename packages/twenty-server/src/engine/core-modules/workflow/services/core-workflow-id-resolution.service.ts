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

  async resolveWorkspaceVersionIdOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<{
    coreWorkflowVersion: WorkflowVersionEntity;
    workspaceWorkflowVersionId: string;
  }> {
    const resolved = await this.resolveWorkspaceVersionIdIfCoreVersionExists({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId,
    });

    if (!isDefined(resolved)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    return resolved;
  }

  // Everything that reaches a workflow by id comes through here, so this is
  // where a workflow private to someone else stops being resolvable at all.
  async resolveWorkspaceVersionIdIfCoreVersionExists({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<{
    coreWorkflowVersion: WorkflowVersionEntity;
    workspaceWorkflowVersionId: string;
  } | null> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      return null;
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

    const workspaceWorkflowVersionId =
      coreWorkflowVersion.workspaceWorkflowVersionId;

    if (!isDefined(workspaceWorkflowVersionId)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' has no workspace mirror alias`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version is not correctly linked to its mirror`,
        },
      );
    }

    return {
      coreWorkflowVersion,
      workspaceWorkflowVersionId,
    };
  }

  async resolveWorkspaceWorkflowIdOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowId: string;
  }): Promise<{
    coreWorkflow: WorkflowEntity;
    workspaceWorkflowId: string;
  }> {
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

    const workspaceWorkflowId = coreWorkflow.workspaceWorkflowId;

    if (!isDefined(workspaceWorkflowId)) {
      throw new WorkflowQueryValidationException(
        `Core workflow '${coreWorkflowId}' has no workspace mirror row`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow is not correctly linked to its mirror`,
        },
      );
    }

    return { coreWorkflow, workspaceWorkflowId };
  }
}
