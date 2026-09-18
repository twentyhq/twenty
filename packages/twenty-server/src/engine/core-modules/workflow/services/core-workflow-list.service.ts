import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

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

const GROUPED_WORKFLOW_COLUMNS = `c.id, c.name, c."createdAt", c."updatedAt"`;

const CORE_WORKFLOW_AGGREGATE_COLUMNS = `
         c.name,
         c."lastPublishedVersionId", c."lastPublishedCoreWorkflowVersionId",
         c."applicationId",
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
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    const [coreWorkflows, coreWorkflowVersions] = await Promise.all([
      this.coreWorkflowRepository.find(workspaceId, {
        where: { id: In(coreWorkflowIds) },
      }),
      this.coreWorkflowVersionRepository.find(workspaceId, {
        where: { coreWorkflowId: In(coreWorkflowIds) },
        order: { createdAt: 'ASC', id: 'ASC' },
      }),
    ]);

    const workflowById = new Map(
      coreWorkflows.map((workflow) => [workflow.id, workflow]),
    );

    return coreWorkflowIds.flatMap((coreWorkflowId) => {
      const workflow = workflowById.get(coreWorkflowId);

      if (!isDefined(workflow)) {
        return [];
      }

      const versionsInCreationOrder = coreWorkflowVersions.filter(
        (version) => version.coreWorkflowId === coreWorkflowId,
      );

      const versions = versionsInCreationOrder
        .map((version, index) => ({
          id: version.id,
          coreWorkflowId: version.coreWorkflowId,
          label: buildCoreWorkflowVersionLabel(index + 1),
          status: version.status,
          workspaceWorkflowVersionId: version.workspaceWorkflowVersionId,
          workspaceWorkflowId: workflow.workspaceWorkflowId,
          trigger: version.triggers?.[0] ?? null,
          steps: version.steps ?? null,
          createdAt: version.createdAt.toISOString(),
          updatedAt: version.updatedAt.toISOString(),
        }))
        .reverse();

      const currentVersion =
        versions.find(
          (version) => version.status === WorkflowVersionStatus.DRAFT,
        ) ??
        versions.find(
          (version) => version.status === WorkflowVersionStatus.ACTIVE,
        ) ??
        versions[0];

      if (!isDefined(currentVersion)) {
        return [];
      }

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
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString(),
          },
          versions,
          currentVersion,
        },
      ];
    });
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    { first, after, orderBy, orderByDirection, filter }: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    const { column, cursorExpression, nullable, cast } =
      SORT_COLUMN_BY_FIELD[orderBy];
    const isAscending = orderByDirection === CoreWorkflowOrderByDirection.ASC;
    const comparator = isAscending ? '>' : '<';
    const direction = isAscending ? 'ASC' : 'DESC';
    const nullsClause = nullable ? ' NULLS LAST' : '';

    const parameters: unknown[] = [workspaceId];

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
       ${keysetCondition}
       GROUP BY ${GROUP_BY_CLAUSE}
       ${havingClause}
       ORDER BY ${column} ${direction}${nullsClause}, c.id ${direction}
       LIMIT ${limitParameter}`,
      parameters,
    );

    const totalCount = await this.countByWorkspaceId({
      workspaceId,
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
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    return this.findOneByFilterExpression({
      workspaceId,
      filterExpression: 'c.id = $2',
      filterParameter: coreWorkflowId,
    });
  }

  async findOneByWorkspaceWorkflowId({
    workspaceId,
    workspaceWorkflowId,
  }: {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowDTO | null> {
    return this.findOneByFilterExpression({
      workspaceId,
      filterExpression: 'c."workspaceWorkflowId" = $2',
      filterParameter: workspaceWorkflowId,
    });
  }

  private async findOneByFilterExpression({
    workspaceId,
    filterExpression,
    filterParameter,
  }: {
    workspaceId: string;
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
         AND ${filterExpression}
       GROUP BY ${GROUP_BY_CLAUSE}`,
      [workspaceId, filterParameter],
    );

    const [row] = rows;

    if (!isDefined(row)) {
      return null;
    }

    return toCoreWorkflowDTO(row);
  }

  private async countByWorkspaceId({
    workspaceId,
    filterPredicate,
    filterParameters,
  }: {
    workspaceId: string;
    filterPredicate?: string;
    filterParameters: unknown[];
  }): Promise<number> {
    const parameters: unknown[] = [workspaceId];

    if (!isDefined(filterPredicate)) {
      const [{ totalCount }]: [{ totalCount: number }] =
        await this.coreDataSource.query(
          `SELECT count(*)::int AS "totalCount"
           FROM core."workflow" c
           WHERE c."workspaceId" = $1`,
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
           GROUP BY ${GROUPED_WORKFLOW_COLUMNS}
           HAVING ${filterPredicate}
         ) filtered`,
        parameters,
      );

    return totalCount;
  }
}
