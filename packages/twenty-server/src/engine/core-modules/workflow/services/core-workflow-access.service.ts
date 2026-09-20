import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

// A workflow's versions carry its whole definition, so reaching one by id has
// to answer to the same rule as reaching the workflow. Both asserts live here
// so a private workflow has one deny to audit rather than one per entry point.
@Injectable()
export class CoreWorkflowAccessService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async assertCoreWorkflowsAreAccessibleOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowIds: string[];
  }): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    const coreWorkflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: { id: In(coreWorkflowIds) },
      select: {
        id: true,
        visibility: true,
        createdByUserWorkspaceId: true,
      },
    });

    // An id nobody owns keeps behaving exactly as it did before, so an unknown
    // or already deleted workflow is still a no-op rather than a refusal.
    const inaccessibleCoreWorkflow = coreWorkflows.find(
      (coreWorkflow) =>
        coreWorkflow.visibility === WorkflowVisibility.PRIVATE &&
        !canChangeCoreWorkflowVisibility({
          createdByUserWorkspaceId: coreWorkflow.createdByUserWorkspaceId,
          userWorkspaceId,
        }),
    );

    if (isDefined(inaccessibleCoreWorkflow)) {
      throw new WorkflowQueryValidationException(
        `Core workflow '${inaccessibleCoreWorkflow.id}' is private to another member`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          // the same message a missing workflow gets, so a private one does not
          // announce that it exists
          userFriendlyMessage: msg`Workflow not found`,
        },
      );
    }
  }

  async assertCoreWorkflowVersionsAreAccessibleOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionIds: string[];
  }): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { id: In(coreWorkflowVersionIds) },
        select: { id: true, coreWorkflowId: true },
      },
    );

    const coreWorkflowIds = [
      ...new Set(
        coreWorkflowVersions
          .map(({ coreWorkflowId }) => coreWorkflowId)
          .filter(isDefined),
      ),
    ];

    await this.assertCoreWorkflowsAreAccessibleOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds,
    });
  }

  async isCoreWorkflowAccessible({
    workspaceId,
    userWorkspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowId: string;
  }): Promise<boolean> {
    try {
      await this.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      });

      return true;
    } catch {
      return false;
    }
  }
}
