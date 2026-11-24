import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { type CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type CoreWorkflowReader } from 'src/engine/core-modules/workflow/types/core-workflow-reader.type';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { getCoreWorkflowKeysetSort } from 'src/engine/core-modules/workflow/utils/get-core-workflow-keyset-sort.util';
import { fromFlatWorkflowToCoreWorkflowDto } from 'src/engine/core-modules/workflow/utils/from-flat-workflow-to-core-workflow-dto.util';
import { isFlatWorkflowReadableByReader } from 'src/engine/core-modules/workflow/utils/is-flat-workflow-readable-by-reader.util';
import { getCoreWorkflowCurrentVersion } from 'src/engine/core-modules/workflow/utils/get-core-workflow-current-version.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUuidPropertyInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-uuid-property-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
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
    ...reader
  }: CoreWorkflowReader & {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'coreWorkflowVersionsByCoreWorkflowId',
      ]);

    return findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: coreWorkflowIds,
      flatEntityMaps: flatWorkflowMaps,
    })
      .filter((flatWorkflow) =>
        isFlatWorkflowReadableByReader({ flatWorkflow, ...reader }),
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
              userWorkspaceId: reader.userWorkspaceId,
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
    ...reader
  }: CoreWorkflowsArgs &
    CoreWorkflowReader & {
      workspaceId: string;
    }): Promise<CoreWorkflowConnectionDTO> {
    const filterPredicate = buildCoreWorkflowFilterPredicate(filter);

    const readableFlatWorkflows = await this.findReadableFlatWorkflows({
      workspaceId,
      reader,
    });

    const matchingFlatWorkflows = readableFlatWorkflows.filter(filterPredicate);

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
        userWorkspaceId: reader.userWorkspaceId,
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
    ...reader
  }: CoreWorkflowReader & {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
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
      !isFlatWorkflowReadableByReader({ flatWorkflow, ...reader })
    ) {
      return null;
    }

    return fromFlatWorkflowToCoreWorkflowDto({
      flatWorkflow,
      statuses:
        coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]?.statuses ?? [],
      userWorkspaceId: reader.userWorkspaceId,
    });
  }

  async findOneByWorkspaceWorkflowId({
    workspaceId,
    workspaceWorkflowId,
    ...reader
  }: CoreWorkflowReader & {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'coreWorkflowVersionsByCoreWorkflowId',
      ]);

    const flatWorkflow = findFlatEntityByUuidPropertyInFlatEntityMaps({
      flatEntityMaps: flatWorkflowMaps,
      propertyName: 'workspaceWorkflowId',
      uuid: workspaceWorkflowId,
    });

    if (
      !isDefined(flatWorkflow) ||
      !isFlatWorkflowReadableByReader({ flatWorkflow, ...reader })
    ) {
      return null;
    }

    return fromFlatWorkflowToCoreWorkflowDto({
      flatWorkflow,
      statuses:
        coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]?.statuses ?? [],
      userWorkspaceId: reader.userWorkspaceId,
    });
  }

  private async findReadableFlatWorkflows({
    workspaceId,
    reader,
  }: {
    workspaceId: string;
    reader: CoreWorkflowReader;
  }): Promise<FlatWorkflowWithStatuses[]> {
    const { flatWorkflowMaps, coreWorkflowVersionsByCoreWorkflowId } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'coreWorkflowVersionsByCoreWorkflowId',
      ]);

    return Object.values(flatWorkflowMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatWorkflow) =>
        isFlatWorkflowReadableByReader({ flatWorkflow, ...reader }),
      )
      .map((flatWorkflow) => ({
        ...flatWorkflow,
        statuses:
          coreWorkflowVersionsByCoreWorkflowId[flatWorkflow.id]?.statuses ?? [],
      }));
  }
}
