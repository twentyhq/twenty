import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { type CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { compareFlatWorkflows } from 'src/engine/core-modules/workflow/utils/compare-flat-workflows.util';
import { computeCoreWorkflowStatusesFromFlatWorkflowVersions } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses-from-flat-workflow-versions.util';
import { fromFlatWorkflowToCoreWorkflowDto } from 'src/engine/core-modules/workflow/utils/from-flat-workflow-to-core-workflow-dto.util';
import { getCoreWorkflowCurrentVersion } from 'src/engine/core-modules/workflow/utils/get-core-workflow-current-version.util';
import { groupFlatWorkflowVersionsByCoreWorkflowId } from 'src/engine/core-modules/workflow/utils/group-flat-workflow-versions-by-core-workflow-id.util';
import { isCoreWorkflowVisibleToUser } from 'src/engine/core-modules/workflow/utils/is-core-workflow-visible-to-user.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { paginateMetadataOrderedItems } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-ordered-items.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type CoreWorkflowReader = CoreWorkflowReadCaller & {
  userWorkspaceId: string | undefined;
};

type FlatWorkflowWithStatuses = FlatWorkflow & {
  statuses: WorkflowStatus[];
};

const isFlatWorkflowReadableByReader = ({
  flatWorkflow,
  userWorkspaceId,
  callerApplication,
  workspaceCustomApplicationId,
}: CoreWorkflowReader & {
  flatWorkflow: Pick<
    FlatWorkflow,
    'isPrivate' | 'createdByUserWorkspaceId' | 'applicationId'
  >;
}): boolean =>
  isCoreWorkflowVisibleToUser({
    isPrivate: flatWorkflow.isPrivate,
    createdByUserWorkspaceId: flatWorkflow.createdByUserWorkspaceId,
    userWorkspaceId,
  }) &&
  canCallerReachApplication({
    callingApplication: callerApplication,
    applicationId: flatWorkflow.applicationId,
    operation: 'read',
    workspaceCustomApplicationId,
  });

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
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const flatWorkflowVersionsByCoreWorkflowId =
      groupFlatWorkflowVersionsByCoreWorkflowId(flatWorkflowVersionMaps);

    return findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: coreWorkflowIds,
      flatEntityMaps: flatWorkflowMaps,
    })
      .filter((flatWorkflow) =>
        isFlatWorkflowReadableByReader({ flatWorkflow, ...reader }),
      )
      .flatMap((flatWorkflow) => {
        const flatWorkflowVersions =
          flatWorkflowVersionsByCoreWorkflowId.get(flatWorkflow.id) ?? [];

        const versions = buildCoreWorkflowVersionSummaries({
          flatWorkflowVersionsInCreationOrder: flatWorkflowVersions,
          workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
        });

        const currentVersion = getCoreWorkflowCurrentVersion({
          versionsByRecency: versions,
          lastPublishedCoreWorkflowVersionId:
            flatWorkflow.lastPublishedCoreWorkflowVersionId,
        });

        const currentFlatWorkflowVersion = isDefined(currentVersion)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: currentVersion.id,
              flatEntityMaps: flatWorkflowVersionMaps,
            })
          : undefined;

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
              statuses:
                computeCoreWorkflowStatusesFromFlatWorkflowVersions(
                  flatWorkflowVersions,
                ),
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

    const matchingFlatWorkflows = readableFlatWorkflows
      .filter(filterPredicate)
      .sort(compareFlatWorkflows({ orderBy, orderByDirection }));

    const page = paginateMetadataOrderedItems({
      items: matchingFlatWorkflows,
      pagination: { limit: first, direction: 'forward', afterId: after },
    });

    return {
      edges: page.items.map((flatWorkflow) => ({
        node: fromFlatWorkflowToCoreWorkflowDto({
          flatWorkflow,
          statuses: flatWorkflow.statuses,
          userWorkspaceId: reader.userWorkspaceId,
        }),
        cursor: flatWorkflow.id,
      })),
      pageInfo: {
        endCursor: page.pageInfo.endCursor,
        hasNextPage: page.pageInfo.hasNextPage,
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
    return this.findOneReadable({
      workspaceId,
      reader,
      matchesFlatWorkflow: ({ id }) => id === coreWorkflowId,
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
    return this.findOneReadable({
      workspaceId,
      reader,
      matchesFlatWorkflow: (flatWorkflow) =>
        flatWorkflow.workspaceWorkflowId === workspaceWorkflowId,
    });
  }

  private async findOneReadable({
    workspaceId,
    reader,
    matchesFlatWorkflow,
  }: {
    workspaceId: string;
    reader: CoreWorkflowReader;
    matchesFlatWorkflow: (flatWorkflow: FlatWorkflow) => boolean;
  }): Promise<CoreWorkflowDTO | null> {
    const [flatWorkflow] = await this.findReadableFlatWorkflows({
      workspaceId,
      reader,
      matchesFlatWorkflow,
    });

    return isDefined(flatWorkflow)
      ? fromFlatWorkflowToCoreWorkflowDto({
          flatWorkflow,
          statuses: flatWorkflow.statuses,
          userWorkspaceId: reader.userWorkspaceId,
        })
      : null;
  }

  private async findReadableFlatWorkflows({
    workspaceId,
    reader,
    matchesFlatWorkflow = () => true,
  }: {
    workspaceId: string;
    reader: CoreWorkflowReader;
    matchesFlatWorkflow?: (flatWorkflow: FlatWorkflow) => boolean;
  }): Promise<FlatWorkflowWithStatuses[]> {
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const flatWorkflowVersionsByCoreWorkflowId =
      groupFlatWorkflowVersionsByCoreWorkflowId(flatWorkflowVersionMaps);

    return Object.values(flatWorkflowMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatWorkflow) =>
          matchesFlatWorkflow(flatWorkflow) &&
          isFlatWorkflowReadableByReader({ flatWorkflow, ...reader }),
      )
      .map((flatWorkflow) => ({
        ...flatWorkflow,
        statuses: computeCoreWorkflowStatusesFromFlatWorkflowVersions(
          flatWorkflowVersionsByCoreWorkflowId.get(flatWorkflow.id) ?? [],
        ),
      }));
  }
}
