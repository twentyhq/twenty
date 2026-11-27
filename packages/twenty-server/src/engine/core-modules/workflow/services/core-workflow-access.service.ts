import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { buildCoreWorkflowNotFoundException } from 'src/engine/core-modules/workflow/utils/build-core-workflow-not-found-exception.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { isPrivatableEntityVisibleToCaller } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-visible-to-caller.util';
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
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async assertCoreWorkflowsAreEditableOrThrow({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.assertLoadedCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      coreWorkflows: await this.findFlatWorkflows({
        workspaceId,
        coreWorkflowIds,
      }),
    });
  }

  async findEditableCoreWorkflowOrThrow({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<WorkflowEntity> {
    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowId } },
    );

    if (!isDefined(coreWorkflow)) {
      throw buildCoreWorkflowNotFoundException(coreWorkflowId);
    }

    await this.assertLoadedCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      coreWorkflows: [coreWorkflow],
    });

    return coreWorkflow;
  }

  async findReadableCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<WorkflowVersionEntity | null> {
    const loaded = await this.findCoreWorkflowVersionWithWorkflow({
      workspaceId,
      coreWorkflowVersionId,
    });

    if (!isDefined(loaded)) {
      return null;
    }

    if (isDefined(loaded.coreWorkflow)) {
      this.assertLoadedCoreWorkflowsAreVisibleOrThrow({
        coreWorkflows: [loaded.coreWorkflow],
      });
    }

    return loaded.coreWorkflowVersion;
  }

  async findEditableCoreWorkflowVersionOrThrow({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<{
    coreWorkflowVersion: WorkflowVersionEntity;
    coreWorkflow: WorkflowEntity | null;
  }> {
    const loaded = await this.findCoreWorkflowVersionWithWorkflow({
      workspaceId,
      coreWorkflowVersionId,
    });

    if (!isDefined(loaded)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    if (isDefined(loaded.coreWorkflow)) {
      await this.assertLoadedCoreWorkflowsAreEditableOrThrow({
        workspaceId,
        coreWorkflows: [loaded.coreWorkflow],
      });
    }

    return loaded;
  }

  async assertCoreWorkflowVersionsAreStartableByApplicationOrThrow({
    workspaceId,
    workspaceCustomApplicationId,
    callerApplication,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    callerApplication: FlatApplication | undefined;
    coreWorkflowVersionIds: string[];
  }): Promise<void> {
    const reachableApplications = getReachableApplications({
      callingApplication: callerApplication,
      operation: 'trigger',
      workspaceCustomApplicationId,
    });

    if (
      reachableApplications.type === 'all' ||
      coreWorkflowVersionIds.length === 0
    ) {
      return;
    }

    const coreWorkflows = await this.findFlatWorkflows({
      workspaceId,
      coreWorkflowIds: await this.findParentCoreWorkflowIds({
        workspaceId,
        coreWorkflowVersionIds,
      }),
    });

    const hasWorkflowOfAnotherApplication = coreWorkflows.some(
      ({ applicationId }) =>
        applicationId !== reachableApplications.applicationId,
    );

    if (hasWorkflowOfAnotherApplication) {
      throw new WorkflowQueryValidationException(
        `Application '${reachableApplications.applicationId}' cannot start a workflow owned by another application`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`An application can only start its own workflows.`,
        },
      );
    }
  }

  async assertCoreWorkflowsAreAccessibleOrThrow({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    const [inaccessibleCoreWorkflow] = await this.findInaccessibleCoreWorkflows(
      {
        workspaceId,
        coreWorkflowIds,
      },
    );

    if (isDefined(inaccessibleCoreWorkflow)) {
      throw this.buildPrivateCoreWorkflowException(inaccessibleCoreWorkflow.id);
    }
  }

  async assertCoreWorkflowVersionsAreAccessibleOrThrow({
    workspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    await this.assertCoreWorkflowsAreAccessibleOrThrow({
      workspaceId,
      coreWorkflowIds: await this.findParentCoreWorkflowIds({
        workspaceId,
        coreWorkflowVersionIds,
      }),
    });
  }

  // The command menu lists every member's manual triggers in one read, so the rule comes back as a filter.
  async findInaccessibleWorkflowVersionIds({
    workspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<Set<string>> {
    if (coreWorkflowVersionIds.length === 0) {
      return new Set();
    }

    const coreWorkflowVersions = await this.findFlatWorkflowVersions({
      workspaceId,
      coreWorkflowVersionIds,
    });

    const inaccessibleCoreWorkflows = await this.findInaccessibleCoreWorkflows({
      workspaceId,
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
      coreWorkflowVersions
        .filter(
          ({ coreWorkflowId }) =>
            isDefined(coreWorkflowId) &&
            inaccessibleCoreWorkflowIds.has(coreWorkflowId),
        )
        .map(({ id }) => id),
    );
  }

  private async findCoreWorkflowVersionWithWorkflow({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<{
    coreWorkflowVersion: WorkflowVersionEntity;
    coreWorkflow: WorkflowEntity | null;
  } | null> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      return null;
    }

    if (!isDefined(coreWorkflowVersion.coreWorkflowId)) {
      return { coreWorkflowVersion, coreWorkflow: null };
    }

    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowVersion.coreWorkflowId } },
    );

    return { coreWorkflowVersion, coreWorkflow };
  }

  private async assertLoadedCoreWorkflowsAreEditableOrThrow({
    workspaceId,
    coreWorkflows,
  }: {
    workspaceId: string;
    coreWorkflows: Pick<
      WorkflowEntity,
      'id' | 'applicationId' | 'isPrivate' | 'createdByUserWorkspaceId'
    >[];
  }): Promise<void> {
    if (coreWorkflows.length === 0) {
      return;
    }

    this.assertLoadedCoreWorkflowsAreVisibleOrThrow({
      coreWorkflows,
    });

    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      coreWorkflows.some(
        (coreWorkflow) =>
          coreWorkflow.applicationId !== workspaceCustomFlatApplication.id &&
          coreWorkflow.applicationId !== twentyStandardFlatApplication.id,
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

  private assertLoadedCoreWorkflowsAreVisibleOrThrow({
    coreWorkflows,
  }: {
    coreWorkflows: Pick<
      WorkflowEntity,
      'id' | 'isPrivate' | 'createdByUserWorkspaceId'
    >[];
  }): void {
    const inaccessibleCoreWorkflow = coreWorkflows.find(
      (coreWorkflow) =>
        !isPrivatableEntityVisibleToCaller({ privatableEntity: coreWorkflow }),
    );

    if (isDefined(inaccessibleCoreWorkflow)) {
      throw this.buildPrivateCoreWorkflowException(inaccessibleCoreWorkflow.id);
    }
  }

  private buildPrivateCoreWorkflowException(coreWorkflowId: string) {
    return new WorkflowQueryValidationException(
      `Core workflow '${coreWorkflowId}' is private to another member`,
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        // Same message as a missing workflow, so a private one does not announce that it exists.
        userFriendlyMessage: msg`Workflow not found`,
      },
    );
  }

  private async findInaccessibleCoreWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<FlatWorkflow[]> {
    const coreWorkflows = await this.findFlatWorkflows({
      workspaceId,
      coreWorkflowIds,
    });

    // Unknown or deleted ids stay a no-op rather than a refusal.
    return coreWorkflows.filter(
      (coreWorkflow) =>
        !isPrivatableEntityVisibleToCaller({ privatableEntity: coreWorkflow }),
    );
  }

  private async findFlatWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<FlatWorkflow[]> {
    if (coreWorkflowIds.length === 0) {
      return [];
    }

    const { flatWorkflowMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
      ]);

    return findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: coreWorkflowIds,
      flatEntityMaps: flatWorkflowMaps,
    });
  }

  private async findFlatWorkflowVersions({
    workspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<FlatWorkflowVersion[]> {
    const { flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);

    return findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: coreWorkflowVersionIds,
      flatEntityMaps: flatWorkflowVersionMaps,
    });
  }

  private async findParentCoreWorkflowIds({
    workspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<string[]> {
    const coreWorkflowVersions = await this.findFlatWorkflowVersions({
      workspaceId,
      coreWorkflowVersionIds,
    });

    return [
      ...new Set(
        coreWorkflowVersions
          .map(({ coreWorkflowId }) => coreWorkflowId)
          .filter(isDefined),
      ),
    ];
  }
}
