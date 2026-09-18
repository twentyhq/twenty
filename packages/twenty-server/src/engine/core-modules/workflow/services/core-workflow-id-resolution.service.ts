import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
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
  ) {}

  async resolveWorkspaceVersionIdOrThrow({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<{
    coreWorkflowVersion: WorkflowVersionEntity;
    workspaceWorkflowVersionId: string;
  }> {
    const resolved = await this.resolveWorkspaceVersionIdIfCoreVersionExists({
      workspaceId,
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

  async resolveWorkspaceVersionIdIfCoreVersionExists({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
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
    coreWorkflowId,
  }: {
    workspaceId: string;
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
