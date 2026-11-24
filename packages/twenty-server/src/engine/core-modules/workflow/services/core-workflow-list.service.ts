import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/common/utils/cursors.util';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  type CoreWorkflowsArgs,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { buildCoreWorkflowVersionSummaries } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-summaries.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { getCoreWorkflowCurrentVersion } from 'src/engine/core-modules/workflow/utils/get-core-workflow-current-version.util';
import { groupFlatWorkflowVersionsByCoreWorkflowId } from 'src/engine/core-modules/workflow/utils/group-flat-workflow-versions-by-core-workflow-id.util';
import { isCoreWorkflowVisibleToUser } from 'src/engine/core-modules/workflow/utils/is-core-workflow-visible-to-user.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type CoreWorkflowCursor = {
  sortValue: string | null;
  id: string;
};

type ReadableCoreWorkflow = {
  flatWorkflow: FlatWorkflow;
  statuses: WorkflowStatus[];
};

type CoreWorkflowReader = CoreWorkflowReadCaller & {
  userWorkspaceId: string | undefined;
};

const SORT_PROPERTY_BY_FIELD: Record<
  CoreWorkflowOrderByField,
  'name' | 'updatedAt'
> = {
  [CoreWorkflowOrderByField.NAME]: 'name',
  [CoreWorkflowOrderByField.UPDATED_AT]: 'updatedAt',
};

const compareIds = (firstId: string, secondId: string): number => {
  if (firstId === secondId) {
    return 0;
  }

  return firstId < secondId ? -1 : 1;
};

const compareSortValues = ({
  orderBy,
  firstSortValue,
  secondSortValue,
}: {
  orderBy: CoreWorkflowOrderByField;
  firstSortValue: string;
  secondSortValue: string;
}): number =>
  orderBy === CoreWorkflowOrderByField.UPDATED_AT
    ? Date.parse(firstSortValue) - Date.parse(secondSortValue)
    : firstSortValue.localeCompare(secondSortValue);

const buildCoreWorkflowCursorComparator =
  ({
    orderBy,
    orderByDirection,
  }: {
    orderBy: CoreWorkflowOrderByField;
    orderByDirection: CoreWorkflowOrderByDirection;
  }) =>
  ({
    firstCursor,
    secondCursor,
  }: {
    firstCursor: CoreWorkflowCursor;
    secondCursor: CoreWorkflowCursor;
  }): number => {
    const directionFactor =
      orderByDirection === CoreWorkflowOrderByDirection.ASC ? 1 : -1;
    const firstSortValue = firstCursor.sortValue;
    const secondSortValue = secondCursor.sortValue;

    if (isDefined(firstSortValue) !== isDefined(secondSortValue)) {
      return isDefined(firstSortValue) ? -1 : 1;
    }

    const sortValueComparison =
      isDefined(firstSortValue) && isDefined(secondSortValue)
        ? compareSortValues({ orderBy, firstSortValue, secondSortValue })
        : 0;

    return (
      directionFactor *
      (sortValueComparison !== 0
        ? sortValueComparison
        : compareIds(firstCursor.id, secondCursor.id))
    );
  };

const computeCoreWorkflowStatusesFromVersions = (
  flatWorkflowVersions: Pick<FlatWorkflowVersion, 'status'>[],
): WorkflowStatus[] =>
  computeCoreWorkflowStatuses({
    hasDraftVersion: flatWorkflowVersions.some(
      ({ status }) => status === WorkflowVersionStatus.DRAFT,
    ),
    hasActiveVersion: flatWorkflowVersions.some(
      ({ status }) => status === WorkflowVersionStatus.ACTIVE,
    ),
    hasDeactivatedVersion: flatWorkflowVersions.some(
      ({ status }) => status === WorkflowVersionStatus.DEACTIVATED,
    ),
  });

const isCoreWorkflowReadableByReader = ({
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

const toCoreWorkflowDTO = ({
  flatWorkflow,
  statuses,
  userWorkspaceId,
}: ReadableCoreWorkflow & {
  userWorkspaceId: string | undefined;
}): CoreWorkflowDTO => ({
  id: flatWorkflow.id,
  name: flatWorkflow.name,
  statuses,
  lastPublishedCoreWorkflowVersionId:
    flatWorkflow.lastPublishedCoreWorkflowVersionId,
  applicationId: flatWorkflow.applicationId,
  workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
  isSystem: flatWorkflow.isSystem,
  isPrivate: flatWorkflow.isPrivate,
  canChangeVisibility: canChangeCoreWorkflowVisibility({
    createdByUserWorkspaceId: flatWorkflow.createdByUserWorkspaceId,
    userWorkspaceId,
  }),
  createdAt: flatWorkflow.createdAt,
  updatedAt: flatWorkflow.updatedAt,
});

@Injectable()
export class CoreWorkflowListService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findManyWithCurrentVersions({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowIds,
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
      groupFlatWorkflowVersionsByCoreWorkflowId({
        flatWorkflowVersionMaps,
        coreWorkflowIds: new Set(coreWorkflowIds),
      });

    return coreWorkflowIds.flatMap((coreWorkflowId) => {
      const flatWorkflow = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: coreWorkflowId,
        flatEntityMaps: flatWorkflowMaps,
      });

      if (
        !isDefined(flatWorkflow) ||
        !isCoreWorkflowReadableByReader({
          flatWorkflow,
          userWorkspaceId,
          callerApplication,
          workspaceCustomApplicationId,
        })
      ) {
        return [];
      }

      const flatWorkflowVersionsInCreationOrder =
        flatWorkflowVersionsByCoreWorkflowId.get(coreWorkflowId) ?? [];

      const currentFlatWorkflowVersion = getCoreWorkflowCurrentVersion({
        versionsByRecency: [...flatWorkflowVersionsInCreationOrder].reverse(),
        lastPublishedCoreWorkflowVersionId:
          flatWorkflow.lastPublishedCoreWorkflowVersionId,
      });

      const versions = buildCoreWorkflowVersionSummaries({
        flatWorkflowVersionsInCreationOrder,
        workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
      });

      const currentVersionSummary = versions.find(
        (version) => version.id === currentFlatWorkflowVersion?.id,
      );

      if (
        !isDefined(currentFlatWorkflowVersion) ||
        !isDefined(currentVersionSummary)
      ) {
        return [];
      }

      return [
        {
          workflow: toCoreWorkflowDTO({
            flatWorkflow,
            userWorkspaceId,
            statuses: computeCoreWorkflowStatusesFromVersions(
              flatWorkflowVersionsInCreationOrder,
            ),
          }),
          versions,
          currentVersion: {
            ...currentVersionSummary,
            trigger: currentFlatWorkflowVersion.triggers?.[0] ?? null,
            steps: currentFlatWorkflowVersion.steps ?? null,
          },
        },
      ];
    });
  }

  async findManyByWorkspaceId({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    first,
    after,
    orderBy,
    orderByDirection,
    filter,
  }: CoreWorkflowsArgs &
    CoreWorkflowReader & {
      workspaceId: string;
    }): Promise<CoreWorkflowConnectionDTO> {
    const filterPredicate = buildCoreWorkflowFilterPredicate(filter);
    const compareCursors = buildCoreWorkflowCursorComparator({
      orderBy,
      orderByDirection,
    });

    const readableCoreWorkflows = await this.findReadableCoreWorkflows({
      workspaceId,
      userWorkspaceId,
      callerApplication,
      workspaceCustomApplicationId,
    });

    const matchingCoreWorkflows = readableCoreWorkflows
      .filter(({ flatWorkflow, statuses }) =>
        filterPredicate({
          name: flatWorkflow.name,
          updatedAt: flatWorkflow.updatedAt,
          isSystem: flatWorkflow.isSystem,
          statuses,
        }),
      )
      .map((readableCoreWorkflow) => ({
        readableCoreWorkflow,
        cursor: {
          sortValue:
            readableCoreWorkflow.flatWorkflow[SORT_PROPERTY_BY_FIELD[orderBy]],
          id: readableCoreWorkflow.flatWorkflow.id,
        } satisfies CoreWorkflowCursor,
      }))
      .sort((firstEntry, secondEntry) =>
        compareCursors({
          firstCursor: firstEntry.cursor,
          secondCursor: secondEntry.cursor,
        }),
      );

    const afterCursor = isDefined(after)
      ? decodeCursor<CoreWorkflowCursor>(after)
      : undefined;

    const coreWorkflowsAfterCursor = isDefined(afterCursor)
      ? matchingCoreWorkflows.filter(
          ({ cursor }) =>
            compareCursors({ firstCursor: cursor, secondCursor: afterCursor }) >
            0,
        )
      : matchingCoreWorkflows;

    const edges = coreWorkflowsAfterCursor
      .slice(0, first)
      .map(({ readableCoreWorkflow, cursor }) => ({
        node: toCoreWorkflowDTO({ ...readableCoreWorkflow, userWorkspaceId }),
        cursor: encodeCursorData(cursor),
      }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage: coreWorkflowsAfterCursor.length > first,
      },
      totalCount: matchingCoreWorkflows.length,
    };
  }

  async findOneById({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowId,
  }: CoreWorkflowReader & {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    const [readableCoreWorkflow] = await this.findReadableCoreWorkflows({
      workspaceId,
      userWorkspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      matchesFlatWorkflow: ({ id }) => id === coreWorkflowId,
    });

    return isDefined(readableCoreWorkflow)
      ? toCoreWorkflowDTO({ ...readableCoreWorkflow, userWorkspaceId })
      : null;
  }

  async findOneByWorkspaceWorkflowId({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    workspaceWorkflowId,
  }: CoreWorkflowReader & {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    const [readableCoreWorkflow] = await this.findReadableCoreWorkflows({
      workspaceId,
      userWorkspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      matchesFlatWorkflow: (flatWorkflow) =>
        flatWorkflow.workspaceWorkflowId === workspaceWorkflowId,
    });

    return isDefined(readableCoreWorkflow)
      ? toCoreWorkflowDTO({ ...readableCoreWorkflow, userWorkspaceId })
      : null;
  }

  private async findReadableCoreWorkflows({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    matchesFlatWorkflow = () => true,
  }: CoreWorkflowReader & {
    workspaceId: string;
    matchesFlatWorkflow?: (flatWorkflow: FlatWorkflow) => boolean;
  }): Promise<ReadableCoreWorkflow[]> {
    const { flatWorkflowMaps, flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatWorkflowVersionMaps',
      ]);

    const readableFlatWorkflows = Object.values(
      flatWorkflowMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatWorkflow) =>
          matchesFlatWorkflow(flatWorkflow) &&
          isCoreWorkflowReadableByReader({
            flatWorkflow,
            userWorkspaceId,
            callerApplication,
            workspaceCustomApplicationId,
          }),
      );

    const flatWorkflowVersionsByCoreWorkflowId =
      groupFlatWorkflowVersionsByCoreWorkflowId({
        flatWorkflowVersionMaps,
        coreWorkflowIds: new Set(readableFlatWorkflows.map(({ id }) => id)),
      });

    return readableFlatWorkflows.map((flatWorkflow) => ({
      flatWorkflow,
      statuses: computeCoreWorkflowStatusesFromVersions(
        flatWorkflowVersionsByCoreWorkflowId.get(flatWorkflow.id) ?? [],
      ),
    }));
  }
}
