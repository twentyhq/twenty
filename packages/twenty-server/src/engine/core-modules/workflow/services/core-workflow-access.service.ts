import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
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

    const inaccessibleCoreWorkflow = await this.findInaccessibleCoreWorkflow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds,
    });

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

  // The legacy resolvers are keyed by the workspace mirror's ids rather than
  // the core ones, so they need the same rule reached from the other side.
  async assertWorkspaceWorkflowVersionsAreAccessibleOrThrow({
    workspaceId,
    userWorkspaceId,
    workspaceWorkflowVersionIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowVersionIds: string[];
  }): Promise<void> {
    if (workspaceWorkflowVersionIds.length === 0) {
      return;
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workspaceWorkflowVersionId: In(workspaceWorkflowVersionIds) },
        select: { id: true, coreWorkflowId: true },
      },
    );

    await this.assertCoreWorkflowsAreAccessibleOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds: [
        ...new Set(
          coreWorkflowVersions
            .map(({ coreWorkflowId }) => coreWorkflowId)
            .filter(isDefined),
        ),
      ],
    });
  }

  async assertWorkspaceWorkflowsAreAccessibleOrThrow({
    workspaceId,
    userWorkspaceId,
    workspaceWorkflowIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowIds: string[];
  }): Promise<void> {
    if (workspaceWorkflowIds.length === 0) {
      return;
    }

    const coreWorkflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: { workspaceWorkflowId: In(workspaceWorkflowIds) },
      select: { id: true },
    });

    await this.assertCoreWorkflowsAreAccessibleOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds: coreWorkflows.map(({ id }) => id),
    });
  }

  // The command menu lists every member's manual triggers in one read, so the
  // rule has to come back as a filter rather than a deny.
  async findInaccessibleWorkspaceWorkflowVersionIds({
    workspaceId,
    userWorkspaceId,
    workspaceWorkflowVersionIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowVersionIds: string[];
  }): Promise<Set<string>> {
    if (workspaceWorkflowVersionIds.length === 0) {
      return new Set();
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workspaceWorkflowVersionId: In(workspaceWorkflowVersionIds) },
        select: {
          id: true,
          coreWorkflowId: true,
          workspaceWorkflowVersionId: true,
        },
      },
    );

    const inaccessibleCoreWorkflows = await this.findInaccessibleCoreWorkflows({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds: [
        ...new Set(
          coreWorkflowVersions
            .map(({ coreWorkflowId }) => coreWorkflowId)
            .filter(isDefined),
        ),
      ],
    });

    const inaccessibleCoreWorkflowIds = new Set(
      inaccessibleCoreWorkflows.map(({ id }) => id),
    );

    return new Set(
      coreWorkflowVersions.flatMap(
        ({ coreWorkflowId, workspaceWorkflowVersionId }) =>
          isDefined(coreWorkflowId) &&
          isDefined(workspaceWorkflowVersionId) &&
          inaccessibleCoreWorkflowIds.has(coreWorkflowId)
            ? [workspaceWorkflowVersionId]
            : [],
      ),
    );
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
    const inaccessibleCoreWorkflow = await this.findInaccessibleCoreWorkflow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds: [coreWorkflowId],
    });

    return !isDefined(inaccessibleCoreWorkflow);
  }

  private async findInaccessibleCoreWorkflow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowIds: string[];
  }): Promise<WorkflowEntity | undefined> {
    const [inaccessibleCoreWorkflow] = await this.findInaccessibleCoreWorkflows(
      { workspaceId, userWorkspaceId, coreWorkflowIds },
    );

    return inaccessibleCoreWorkflow;
  }

  private async findInaccessibleCoreWorkflows({
    workspaceId,
    userWorkspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowIds: string[];
  }): Promise<WorkflowEntity[]> {
    if (coreWorkflowIds.length === 0) {
      return [];
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
    return coreWorkflows.filter(
      (coreWorkflow) =>
        coreWorkflow.visibility === WorkflowVisibility.PRIVATE &&
        !canChangeCoreWorkflowVisibility({
          createdByUserWorkspaceId: coreWorkflow.createdByUserWorkspaceId,
          userWorkspaceId,
        }),
    );
  }
}
