import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { compareFlatWorkflowVersionsByCreation } from 'src/engine/core-modules/workflow/utils/compare-flat-workflow-versions-by-creation.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowVersionMaps } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const findFlatWorkflowVersionsInCreationOrder = ({
  flatWorkflowVersionMaps,
  coreWorkflowId,
}: {
  flatWorkflowVersionMaps: FlatWorkflowVersionMaps;
  coreWorkflowId: string;
}): FlatWorkflowVersion[] =>
  Object.values(flatWorkflowVersionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatWorkflowVersion) =>
        flatWorkflowVersion.coreWorkflowId === coreWorkflowId,
    )
    .sort(compareFlatWorkflowVersionsByCreation);

@Injectable()
export class CoreWorkflowVersionListService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async findManyByWorkspaceWorkflowId({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    workspaceWorkflowId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const parentFlatWorkflow = Object.values(
      flatWorkflowMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (flatWorkflow) =>
          flatWorkflow.workspaceWorkflowId === workspaceWorkflowId,
      );

    if (
      !isDefined(parentFlatWorkflow) ||
      !canCallerReachApplication({
        callingApplication: callerApplication,
        applicationId: parentFlatWorkflow.applicationId,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    if (
      !(await this.coreWorkflowAccessService.isCoreWorkflowAccessible({
        workspaceId,
        userWorkspaceId,
        coreWorkflowId: parentFlatWorkflow.id,
      }))
    ) {
      return [];
    }

    return buildCoreWorkflowVersionSummaries({
      flatWorkflowVersionsInCreationOrder:
        findFlatWorkflowVersionsInCreationOrder({
          flatWorkflowVersionMaps,
          coreWorkflowId: parentFlatWorkflow.id,
        }),
      workspaceWorkflowId,
    });
  }

  async findManyByCoreWorkflowId({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const flatWorkflow = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    });

    if (
      !isDefined(flatWorkflow) ||
      !canCallerReachApplication({
        callingApplication: callerApplication,
        applicationId: flatWorkflow.applicationId,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreAccessibleOrThrow(
      { workspaceId, userWorkspaceId, coreWorkflowIds: [coreWorkflowId] },
    );

    return buildCoreWorkflowVersionSummaries({
      flatWorkflowVersionsInCreationOrder:
        findFlatWorkflowVersionsInCreationOrder({
          flatWorkflowVersionMaps,
          coreWorkflowId,
        }),
      workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
    });
  }

  async findOneByCoreWorkflowVersionId({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowVersionId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const flatWorkflowVersion = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowVersionId,
      flatEntityMaps: flatWorkflowVersionMaps,
    });

    const coreWorkflowId = flatWorkflowVersion?.coreWorkflowId;

    if (!isDefined(flatWorkflowVersion) || !isDefined(coreWorkflowId)) {
      return null;
    }

    const flatWorkflow = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    });

    if (
      !canCallerReachApplication({
        callingApplication: callerApplication,
        applicationId: flatWorkflow?.applicationId,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return null;
    }

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreAccessibleOrThrow(
      { workspaceId, userWorkspaceId, coreWorkflowIds: [coreWorkflowId] },
    );

    const versionRank =
      findFlatWorkflowVersionsInCreationOrder({
        flatWorkflowVersionMaps,
        coreWorkflowId,
      }).findIndex(({ id }) => id === flatWorkflowVersion.id) + 1;

    return {
      id: flatWorkflowVersion.id,
      coreWorkflowId,
      label: buildCoreWorkflowVersionLabel(versionRank),
      status: flatWorkflowVersion.status,
      workspaceWorkflowId: flatWorkflow?.workspaceWorkflowId ?? null,
      trigger: flatWorkflowVersion.triggers?.[0] ?? null,
      steps: flatWorkflowVersion.steps ?? null,
      createdAt: flatWorkflowVersion.createdAt,
      updatedAt: flatWorkflowVersion.updatedAt,
    };
  }
}
