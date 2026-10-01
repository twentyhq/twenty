import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { canApplicationStartCoreWorkflow } from 'src/engine/core-modules/workflow/utils/can-application-start-core-workflow.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

// Versions carry the whole definition, so they answer to the workflow's rule; both asserts live here so a private
// workflow has one deny to audit.
@Injectable()
export class CoreWorkflowAccessService {
  constructor(
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async assertCoreWorkflowsAreEditableOrThrow(args: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowIds: string[];
  }): Promise<void> {
    if (args.coreWorkflowIds.length === 0) {
      return;
    }

    await this.assertCoreWorkflowsAreAccessibleOrThrow(args);
    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: args.workspaceId },
      );
    const workflows = await this.coreWorkflowRepository.find(args.workspaceId, {
      where: { id: In(args.coreWorkflowIds) },
      select: { id: true, applicationId: true },
    });
    if (
      workflows.some(
        (workflow) =>
          workflow.applicationId !== workspaceCustomFlatApplication.id &&
          workflow.applicationId !== twentyStandardFlatApplication.id,
      )
    ) {
      throw new WorkflowQueryValidationException(
        'Application workflows can only be changed by synchronizing their application',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`This workflow is managed by an application and is read-only`,
        },
      );
    }
  }

  async assertCoreWorkflowVersionsAreStartableByApplicationOrThrow({
    workspaceId,
    callerApplicationId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    callerApplicationId: string | undefined;
    coreWorkflowVersionIds: string[];
  }): Promise<void> {
    if (
      !isDefined(callerApplicationId) ||
      coreWorkflowVersionIds.length === 0
    ) {
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

    if (coreWorkflowIds.length === 0) {
      return;
    }

    const [
      workflows,
      { workspaceCustomFlatApplication, twentyStandardFlatApplication },
    ] = await Promise.all([
      this.coreWorkflowRepository.find(workspaceId, {
        where: { id: In(coreWorkflowIds) },
        select: { id: true, applicationId: true },
      }),
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
    ]);

    const isStartable = workflows.every((workflow) =>
      canApplicationStartCoreWorkflow({
        callerApplicationId,
        workflowApplicationId: workflow.applicationId,
        workspaceOwnedApplicationIds: [
          workspaceCustomFlatApplication.id,
          twentyStandardFlatApplication.id,
        ],
      }),
    );

    if (!isStartable) {
      throw new WorkflowQueryValidationException(
        `Application '${callerApplicationId}' cannot start a workflow owned by another application`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`An application can only start its own workflows.`,
        },
      );
    }
  }

  async assertWorkspaceWorkflowVersionsAreStartableByApplicationOrThrow({
    workspaceId,
    callerApplicationId,
    workspaceWorkflowVersionIds,
  }: {
    workspaceId: string;
    callerApplicationId: string | undefined;
    workspaceWorkflowVersionIds: string[];
  }): Promise<void> {
    if (
      !isDefined(callerApplicationId) ||
      workspaceWorkflowVersionIds.length === 0
    ) {
      return;
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workspaceWorkflowVersionId: In(workspaceWorkflowVersionIds) },
        select: { id: true },
      },
    );

    await this.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow({
      workspaceId,
      callerApplicationId,
      coreWorkflowVersionIds: coreWorkflowVersions.map(({ id }) => id),
    });
  }

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
          // Same message as a missing workflow, so a private one does not announce that it exists.
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

  // Legacy resolvers use the workspace mirror's ids, so the same rule is reached from that side.
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

  // The command menu lists every member's manual triggers in one read, so the rule comes back as a filter.
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

    // Unknown or deleted ids stay a no-op rather than a refusal.
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
