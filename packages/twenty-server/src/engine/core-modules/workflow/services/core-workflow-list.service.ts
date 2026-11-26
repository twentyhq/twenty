import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { type CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { getCoreWorkflowKeysetSort } from 'src/engine/core-modules/workflow/utils/get-core-workflow-keyset-sort.util';
import { fromFlatWorkflowToCoreWorkflowDto } from 'src/engine/core-modules/workflow/utils/from-flat-workflow-to-core-workflow-dto.util';
import { isFlatWorkflowVisibleToCaller } from 'src/engine/core-modules/workflow/utils/is-flat-workflow-visible-to-caller.util';
import { getCoreWorkflowCurrentVersion } from 'src/engine/core-modules/workflow/utils/get-core-workflow-current-version.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUuidPropertyInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-uuid-property-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type CoreWorkflowVersionsByCoreWorkflowId } from 'src/engine/metadata-modules/flat-workflow-version/types/core-workflow-versions-by-core-workflow-id.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { paginateMetadataItemsByKeyset } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-items-by-keyset.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type FlatWorkflowWithStatuses = FlatWorkflow & {
  statuses: WorkflowStatus[];
};

@Injectable()
export class CoreWorkflowListService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findManyWithCurrentVersions({
    workspaceId,
    coreWorkflowIds,
    ...caller
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.getFlatWorkflowCaches(workspaceId);

    return findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: coreWorkflowIds,
      flatEntityMaps: flatWorkflowMaps,
    })
      .filter((flatWorkflow) =>
        isFlatWorkflowVisibleToCaller({ flatWorkflow, ...caller }),
      )
      .flatMap((flatWorkflow) => {
        const coreWorkflowVersions =
          coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id];
        const flatWorkflowVersionsInCreationOrder =
          coreWorkflowVersions?.flatWorkflowVersionsInCreationOrder ?? [];

        const versions = buildCoreWorkflowVersionSummaries({
          flatWorkflowVersionsInCreationOrder,
          workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
        });

        const currentVersion = getCoreWorkflowCurrentVersion({
          versionsByRecency: versions,
          lastPublishedCoreWorkflowVersionId:
            flatWorkflow.lastPublishedCoreWorkflowVersionId,
        });

        const currentFlatWorkflowVersion =
          flatWorkflowVersionsInCreationOrder.find(
            ({ id }) => id === currentVersion?.id,
          );

        if (
          !isDefined(currentVersion) ||
          !isDefined(currentFlatWorkflowVersion)
        ) {
          return [];
        }

        return [
          {
            workflow: fromFlatWorkflowToCoreWorkflowDto({
              flatWorkflow,
              statuses: coreWorkflowVersions?.statuses ?? [],
            }),
            versions,
            currentVersion: {
              ...currentVersion,
              trigger: currentFlatWorkflowVersion.triggers?.[0] ?? null,
              steps: currentFlatWorkflowVersion.steps ?? null,
            },
          },
        ];
      });
  }

  async findManyByWorkspaceId({
    workspaceId,
    first,
    after,
    orderBy,
    orderByDirection,
    filter,
    ...caller
  }: CoreWorkflowsArgs &
    CoreWorkflowReadCaller & {
      workspaceId: string;
    }): Promise<CoreWorkflowConnectionDTO> {
    const filterPredicate = buildCoreWorkflowFilterPredicate(filter);

    const visibleFlatWorkflows = await this.findFlatWorkflowsVisibleToCaller({
      workspaceId,
      caller,
    });

    const matchingFlatWorkflows = visibleFlatWorkflows.filter(filterPredicate);

    const page = paginateMetadataItemsByKeyset({
      items: matchingFlatWorkflows,
      limit: first,
      after,
      direction: orderByDirection,
      ...getCoreWorkflowKeysetSort(orderBy),
    });

    const edges = page.entries.map(({ item: flatWorkflow, cursor }) => ({
      node: fromFlatWorkflowToCoreWorkflowDto({
        flatWorkflow,
        statuses: flatWorkflow.statuses,
      }),
      cursor,
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges[edges.length - 1]?.cursor ?? null,
        hasNextPage: page.hasNextPage,
      },
      totalCount: matchingFlatWorkflows.length,
    };
  }

  async findOneById({
    workspaceId,
    coreWorkflowId,
    ...caller
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.getFlatWorkflowCaches(workspaceId);

    return this.toCoreWorkflowDtoIfVisible({
      flatWorkflow: findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: coreWorkflowId,
        flatEntityMaps: flatWorkflowMaps,
      }),
      coreWorkflowVersionsByCoreWorkflowId,
      caller,
    });
  }

  async findOneByWorkspaceWorkflowId({
    workspaceId,
    workspaceWorkflowId,
    ...caller
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.getFlatWorkflowCaches(workspaceId);

    return this.toCoreWorkflowDtoIfVisible({
      flatWorkflow: findFlatEntityByUuidPropertyInFlatEntityMaps({
        flatEntityMaps: flatWorkflowMaps,
        propertyName: 'workspaceWorkflowId',
        uuid: workspaceWorkflowId,
      }),
      coreWorkflowVersionsByCoreWorkflowId,
      caller,
    });
  }

  private async findFlatWorkflowsVisibleToCaller({
    workspaceId,
    caller,
  }: {
    workspaceId: string;
    caller: CoreWorkflowReadCaller;
  }): Promise<FlatWorkflowWithStatuses[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.getFlatWorkflowCaches(workspaceId);

    return Object.values(flatWorkflowMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatWorkflow) =>
        isFlatWorkflowVisibleToCaller({ flatWorkflow, ...caller }),
      )
      .map((flatWorkflow) => ({
        ...flatWorkflow,
        statuses:
          coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]?.statuses ?? [],
      }));
  }

  private async getFlatWorkflowCaches(workspaceId: string) {
    return this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkflowMaps',
      'coreWorkflowVersionsByCoreWorkflowId',
    ]);
  }

  private toCoreWorkflowDtoIfVisible({
    flatWorkflow,
    coreWorkflowVersionsByCoreWorkflowId,
    caller,
  }: {
    flatWorkflow: FlatWorkflow | undefined;
    coreWorkflowVersionsByCoreWorkflowId: CoreWorkflowVersionsByCoreWorkflowId;
    caller: CoreWorkflowReadCaller;
  }): CoreWorkflowDTO | null {
    if (
      !isDefined(flatWorkflow) ||
      !isFlatWorkflowVisibleToCaller({ flatWorkflow, ...caller })
    ) {
      return null;
    }

    return fromFlatWorkflowToCoreWorkflowDto({
      flatWorkflow,
      statuses:
        coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]?.statuses ?? [],
    });
  }
}
