import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, In } from 'typeorm';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  type CoreWorkflowsArgs,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { buildCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-sql-predicate.util';
import { buildCoreWorkflowVisibilityWhere } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { canChangeCoreWorkflowVisibilitySelectExpression } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-select-expression.util';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type CoreWorkflowRow = {
  createdAt: Date;
  id: string;
  cursorSortValue: string | null;
  name: string | null;
  lastPublishedVersionId: string | null;
  lastPublishedCoreWorkflowVersionId: string | null;
  applicationId: string | null;
  workspaceWorkflowId: string | null;
  visibility: WorkflowVisibility;
  canChangeVisibility: boolean;
  updatedAt: Date;
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
};

type CoreWorkflowCursor = {
  sortValue: string | null;
  id: string;
};

// sorting and the keyset comparison stay on the raw columns so a btree index
// can serve them; only the cursor value is rendered to text
const SORT_COLUMN_BY_FIELD: Record<
  CoreWorkflowOrderByField,
  { column: string; cursorExpression: string; nullable: boolean; cast: string }
> = {
  [CoreWorkflowOrderByField.NAME]: {
    column: 'c.name',
    cursorExpression: 'c.name',
    nullable: true,
    cast: '',
  },
  [CoreWorkflowOrderByField.UPDATED_AT]: {
    column: 'c."updatedAt"',
    // microsecond-precise text so the cursor round-trips exactly
    cursorExpression: `to_char(c."updatedAt" at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
    nullable: false,
    cast: '::timestamptz',
  },
};

// Every raw query binds the reader as $2, right after the workspace, so the
// filter parameters keep starting at $3 in both the page and the count.
const READER_PARAMETER = '$2';
const VISIBILITY_PREDICATE = buildCoreWorkflowVisibilitySqlPredicate({
  tableAlias: 'c',
  userWorkspaceIdParameter: READER_PARAMETER,
});

const GROUPED_WORKFLOW_COLUMNS = `c.id, c.name, c."createdAt", c."updatedAt"`;

const CORE_WORKFLOW_AGGREGATE_COLUMNS = `
         c.name,
         c."lastPublishedVersionId", c."lastPublishedCoreWorkflowVersionId",
         c."applicationId",
         c."visibility",
         ${canChangeCoreWorkflowVisibilitySelectExpression({ tableAlias: 'c', userWorkspaceIdParameter: READER_PARAMETER })} AS "canChangeVisibility",
         c."createdAt",
         c."updatedAt",
         coalesce(bool_or(v.status = 'DRAFT'), false) AS "hasDraftVersion",
         coalesce(bool_or(v.status = 'ACTIVE'), false) AS "hasActiveVersion",
         coalesce(bool_or(v.status = 'DEACTIVATED'), false) AS "hasDeactivatedVersion"`;

const toCoreWorkflowDTO = (row: CoreWorkflowRow): CoreWorkflowDTO => ({
  id: row.id,
  name: row.name,
  statuses: computeCoreWorkflowStatuses({
    hasDraftVersion: row.hasDraftVersion,
    hasActiveVersion: row.hasActiveVersion,
    hasDeactivatedVersion: row.hasDeactivatedVersion,
  }),
  lastPublishedVersionId: row.lastPublishedVersionId,
  lastPublishedCoreWorkflowVersionId: row.lastPublishedCoreWorkflowVersionId,
  applicationId: row.applicationId,
  workspaceWorkflowId: row.workspaceWorkflowId,
  visibility: row.visibility,
  canChangeVisibility: row.canChangeVisibility,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const CORE_WORKFLOW_VERSIONS_JOIN_CLAUSE = `LEFT JOIN core."workflowVersion" v
     ON v."coreWorkflowId" = c.id AND v."workspaceId" = $1`;

const GROUP_BY_CLAUSE = `${GROUPED_WORKFLOW_COLUMNS}, c."lastPublishedVersionId", c."applicationId", c."workspaceWorkflowId"`;

@Injectable()
export class CoreWorkflowListService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async findManyWithCurrentVersions({
    workspaceId,
    userWorkspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowIds: string[];
  }): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    const [coreWorkflows, coreWorkflowVersions] = await Promise.all([
      this.coreWorkflowRepository.find(workspaceId, {
        where: buildCoreWorkflowVisibilityWhere({
          id: In(coreWorkflowIds),
          userWorkspaceId,
        }),
      }),
      this.coreWorkflowVersionRepository.find(workspaceId, {
        where: { coreWorkflowId: In(coreWorkflowIds) },
        select: {
          id: true,
          coreWorkflowId: true,
          status: true,
          workspaceWorkflowVersionId: true,
          createdAt: true,
          updatedAt: true,
        },
        order: { createdAt: 'ASC', id: 'ASC' },
      }),
    ]);

    const workflowById = new Map(
      coreWorkflows.map((workflow) => [workflow.id, workflow]),
    );

    const versionsByWorkflowId = new Map<string, WorkflowVersionEntity[]>();

    for (const version of coreWorkflowVersions) {
      if (!isDefined(version.coreWorkflowId)) {
        continue;
      }

      const versions = versionsByWorkflowId.get(version.coreWorkflowId) ?? [];

      versions.push(version);
      versionsByWorkflowId.set(version.coreWorkflowId, versions);
    }

    const currentVersionIdByWorkflowId = new Map<string, string>();

    for (const [
      coreWorkflowId,
      versionsInCreationOrder,
    ] of versionsByWorkflowId) {
      const versions = [...versionsInCreationOrder].reverse();
      const currentVersion =
        versions.find(
          (version) => version.status === WorkflowVersionStatus.DRAFT,
        ) ??
        versions.find(
          (version) => version.status === WorkflowVersionStatus.ACTIVE,
        ) ??
        versions[0];

      if (isDefined(currentVersion)) {
        currentVersionIdByWorkflowId.set(coreWorkflowId, currentVersion.id);
      }
    }

    const currentVersionIds = [...currentVersionIdByWorkflowId.values()];
    const currentVersionContents =
      currentVersionIds.length === 0
        ? []
        : await this.coreWorkflowVersionRepository.find(workspaceId, {
            where: { id: In(currentVersionIds) },
            select: { id: true, triggers: true, steps: true },
          });
    const currentVersionContentById = new Map(
      currentVersionContents.map((version) => [version.id, version]),
    );

    return coreWorkflowIds.flatMap((coreWorkflowId) => {
      const workflow = workflowById.get(coreWorkflowId);

      if (!isDefined(workflow)) {
        return [];
      }

      const versionsInCreationOrder =
        versionsByWorkflowId.get(coreWorkflowId) ?? [];

      const versions = versionsInCreationOrder
        .map((version, index) => ({
          id: version.id,
          coreWorkflowId: version.coreWorkflowId,
          label: buildCoreWorkflowVersionLabel(index + 1),
          status: version.status,
          workspaceWorkflowVersionId: version.workspaceWorkflowVersionId,
          workspaceWorkflowId: workflow.workspaceWorkflowId,
          trigger: null,
          steps: null,
          createdAt: version.createdAt.toISOString(),
          updatedAt: version.updatedAt.toISOString(),
        }))
        .reverse();

      const currentVersionId = currentVersionIdByWorkflowId.get(coreWorkflowId);
      const currentVersionMetadata = versions.find(
        (version) => version.id === currentVersionId,
      );

      if (!isDefined(currentVersionMetadata)) {
        return [];
      }

      const currentVersionContent = currentVersionContentById.get(
        currentVersionMetadata.id,
      );
      const currentVersion = {
        ...currentVersionMetadata,
        trigger: currentVersionContent?.triggers?.[0] ?? null,
        steps: currentVersionContent?.steps ?? null,
      };

      return [
        {
          workflow: {
            id: workflow.id,
            name: workflow.name,
            statuses: computeCoreWorkflowStatuses({
              hasDraftVersion: versions.some(
                (version) => version.status === WorkflowVersionStatus.DRAFT,
              ),
              hasActiveVersion: versions.some(
                (version) => version.status === WorkflowVersionStatus.ACTIVE,
              ),
              hasDeactivatedVersion: versions.some(
                (version) =>
                  version.status === WorkflowVersionStatus.DEACTIVATED,
              ),
            }),
            lastPublishedVersionId: workflow.lastPublishedVersionId,
            lastPublishedCoreWorkflowVersionId:
              workflow.lastPublishedCoreWorkflowVersionId,
            applicationId: workflow.applicationId,
            workspaceWorkflowId: workflow.workspaceWorkflowId,
            visibility: workflow.visibility,
            canChangeVisibility: canChangeCoreWorkflowVisibility({
              createdByUserWorkspaceId: workflow.createdByUserWorkspaceId,
              userWorkspaceId,
            }),
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString(),
          },
          versions,
          currentVersion,
        },
      ];
    });
  }

  async findManyByWorkspaceId({
    workspaceId,
    userWorkspaceId,
    first,
    after,
    orderBy,
    orderByDirection,
    filter,
  }: CoreWorkflowsArgs & {
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<CoreWorkflowConnectionDTO> {
    const { column, cursorExpression, nullable, cast } =
      SORT_COLUMN_BY_FIELD[orderBy];
    const isAscending = orderByDirection === CoreWorkflowOrderByDirection.ASC;
    const comparator = isAscending ? '>' : '<';
    const direction = isAscending ? 'ASC' : 'DESC';
    const nullsClause = nullable ? ' NULLS LAST' : '';

    const parameters: unknown[] = [workspaceId, userWorkspaceId ?? null];

    const { predicate: filterPredicate, parameters: filterParameters } =
      buildCoreWorkflowFilterPredicate({
        filter,
        firstParameterIndex: parameters.length + 1,
      });

    parameters.push(...filterParameters);

    let keysetCondition = '';

    if (isDefined(after)) {
      const cursor = decodeCursor<CoreWorkflowCursor>(after);

      if (cursor.sortValue === null) {
        parameters.push(cursor.id);
        keysetCondition = `AND (${column} IS NULL AND c.id ${comparator} $${parameters.length}::uuid)`;
      } else {
        parameters.push(cursor.sortValue);
        const sortValueParameter = `$${parameters.length}`;

        parameters.push(cursor.id);
        const idParameter = `$${parameters.length}`;

        keysetCondition = nullable
          ? `AND (${column} ${comparator} ${sortValueParameter}${cast}
               OR (${column} = ${sortValueParameter}${cast} AND c.id ${comparator} ${idParameter}::uuid)
               OR ${column} IS NULL)`
          : `AND (${column}, c.id) ${comparator} (${sortValueParameter}${cast}, ${idParameter}::uuid)`;
      }
    }

    const havingClause = isDefined(filterPredicate)
      ? `HAVING ${filterPredicate}`
      : '';

    parameters.push(first + 1);
    const limitParameter = `$${parameters.length}`;

    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         ${cursorExpression} AS "cursorSortValue",
         c."workspaceWorkflowId",
         ${CORE_WORKFLOW_AGGREGATE_COLUMNS}
       FROM core."workflow" c
       ${CORE_WORKFLOW_VERSIONS_JOIN_CLAUSE}
       WHERE c."workspaceId" = $1
         AND ${VISIBILITY_PREDICATE}
       ${keysetCondition}
       GROUP BY ${GROUP_BY_CLAUSE}
       ${havingClause}
       ORDER BY ${column} ${direction}${nullsClause}, c.id ${direction}
       LIMIT ${limitParameter}`,
      parameters,
    );

    const totalCount = await this.countByWorkspaceId({
      workspaceId,
      userWorkspaceId,
      filterPredicate,
      filterParameters,
    });

    const hasNextPage = rows.length > first;
    const pageRows = hasNextPage ? rows.slice(0, first) : rows;

    const edges = pageRows.map((row) => ({
      node: toCoreWorkflowDTO(row),
      cursor: encodeCursorData({
        sortValue: row.cursorSortValue,
        id: row.id,
      } satisfies CoreWorkflowCursor),
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage,
      },
      totalCount,
    };
  }

  async findOneById({
    workspaceId,
    userWorkspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    return this.findOneByFilterExpression({
      workspaceId,
      userWorkspaceId,
      filterExpression: 'c.id = $3',
      filterParameter: coreWorkflowId,
    });
  }

  async findOneByWorkspaceWorkflowId({
    workspaceId,
    userWorkspaceId,
    workspaceWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    return this.findOneByFilterExpression({
      workspaceId,
      userWorkspaceId,
      filterExpression: 'c."workspaceWorkflowId" = $3',
      filterParameter: workspaceWorkflowId,
    });
  }

  private async findOneByFilterExpression({
    workspaceId,
    userWorkspaceId,
    filterExpression,
    filterParameter,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    filterExpression: string;
    filterParameter: string;
  }): Promise<CoreWorkflowDTO | null> {
    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         null AS "cursorSortValue",
         c."workspaceWorkflowId",
         ${CORE_WORKFLOW_AGGREGATE_COLUMNS}
       FROM core."workflow" c
       ${CORE_WORKFLOW_VERSIONS_JOIN_CLAUSE}
       WHERE c."workspaceId" = $1
         AND ${VISIBILITY_PREDICATE}
         AND ${filterExpression}
       GROUP BY ${GROUP_BY_CLAUSE}`,
      [workspaceId, userWorkspaceId ?? null, filterParameter],
    );

    const [row] = rows;

    if (!isDefined(row)) {
      return null;
    }

    return toCoreWorkflowDTO(row);
  }

  private async countByWorkspaceId({
    workspaceId,
    userWorkspaceId,
    filterPredicate,
    filterParameters,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    filterPredicate?: string;
    filterParameters: unknown[];
  }): Promise<number> {
    const parameters: unknown[] = [workspaceId, userWorkspaceId ?? null];

    if (!isDefined(filterPredicate)) {
      const [{ totalCount }]: [{ totalCount: number }] =
        await this.coreDataSource.query(
          `SELECT count(*)::int AS "totalCount"
           FROM core."workflow" c
           WHERE c."workspaceId" = $1
             AND ${VISIBILITY_PREDICATE}`,
          parameters,
        );

      return totalCount;
    }

    parameters.push(...filterParameters);

    const [{ totalCount }]: [{ totalCount: number }] =
      await this.coreDataSource.query(
        `SELECT count(*)::int AS "totalCount"
         FROM (
           SELECT c.id
           FROM core."workflow" c
           ${CORE_WORKFLOW_VERSIONS_JOIN_CLAUSE}
           WHERE c."workspaceId" = $1
             AND ${VISIBILITY_PREDICATE}
           GROUP BY ${GROUPED_WORKFLOW_COLUMNS}
           HAVING ${filterPredicate}
         ) filtered`,
        parameters,
      );

    return totalCount;
  }
}
