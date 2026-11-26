import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { isFlatWorkflowVisibleToCaller } from 'src/engine/core-modules/workflow/utils/is-flat-workflow-visible-to-caller.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUuidPropertyInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-uuid-property-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class CoreWorkflowVersionListService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async findManyByWorkspaceWorkflowId({
    workspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    workspaceWorkflowId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'coreWorkflowVersionsByCoreWorkflowId',
      ]);

    const parentFlatWorkflow = findFlatEntityByUuidPropertyInFlatEntityMaps({
      flatEntityMaps: flatWorkflowMaps,
      propertyName: 'workspaceWorkflowId',
      uuid: workspaceWorkflowId,
    });

    if (
      !isDefined(parentFlatWorkflow) ||
      !isFlatWorkflowVisibleToCaller({
        flatWorkflow: parentFlatWorkflow,
        callerApplication,
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return buildCoreWorkflowVersionSummaries({
      flatWorkflowVersionsInCreationOrder:
        coreWorkflowVersionsByCoreWorkflowId[parentFlatWorkflow.id]
          ?.flatWorkflowVersionsInCreationOrder ?? [],
      workspaceWorkflowId: parentFlatWorkflow.workspaceWorkflowId,
    });
  }

  async findManyByCoreWorkflowId({
    workspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'coreWorkflowVersionsByCoreWorkflowId',
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
      { workspaceId, coreWorkflowIds: [flatWorkflow.id] },
    );

    return buildCoreWorkflowVersionSummaries({
      flatWorkflowVersionsInCreationOrder:
        coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]
          ?.flatWorkflowVersionsInCreationOrder ?? [],
      workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
    });
  }

  async findOneByCoreWorkflowVersionId({
    workspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowVersionId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const {
      flatWorkflowMaps,
      flatWorkflowVersionMaps,
      coreWorkflowVersionsByCoreWorkflowId,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
      'coreWorkflowVersionsByCoreWorkflowId',
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
      { workspaceId, coreWorkflowIds: [coreWorkflowId] },
    );

    const flatWorkflowVersionsInCreationOrder =
      coreWorkflowVersionsByCoreWorkflowId[coreWorkflowId]
        ?.flatWorkflowVersionsInCreationOrder ?? [];

    const versionRank =
      flatWorkflowVersionsInCreationOrder.findIndex(
        ({ id }) => id === flatWorkflowVersion.id,
      ) + 1;

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
