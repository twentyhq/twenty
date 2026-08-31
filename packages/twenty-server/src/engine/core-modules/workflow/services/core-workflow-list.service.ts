import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  type CoreWorkflowStatus,
  type CoreWorkflowsArgs,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { buildCoreWorkflowStatusesHavingClause } from 'src/engine/core-modules/workflow/utils/build-core-workflow-statuses-having-clause.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { escapeLikeWildcards } from 'src/engine/core-modules/workflow/utils/escape-like-wildcards.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type CoreWorkflowRow = {
  id: string;
  cursorSortValue: string | null;
  name: string | null;
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

@Injectable()
export class CoreWorkflowListService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async findManyByWorkspaceId(
    workspaceId: string,
    {
      first,
      after,
      orderBy,
      orderByDirection,
      statuses,
      searchTerm,
    }: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const { column, cursorExpression, nullable, cast } =
      SORT_COLUMN_BY_FIELD[orderBy];
    const isAscending = orderByDirection === CoreWorkflowOrderByDirection.ASC;
    const comparator = isAscending ? '>' : '<';
    const direction = isAscending ? 'ASC' : 'DESC';
    const nullsClause = nullable ? ' NULLS LAST' : '';

    const trimmedSearchTerm = searchTerm?.trim();
    const searchPattern = isNonEmptyString(trimmedSearchTerm)
      ? `%${escapeLikeWildcards(trimmedSearchTerm)}%`
      : undefined;
    const statusesFilter = isNonEmptyArray(statuses) ? statuses : undefined;

    const parameters: unknown[] = [workspaceId];
    let searchCondition = '';

    if (isDefined(searchPattern)) {
      parameters.push(searchPattern);
      searchCondition = `AND c.name ILIKE $${parameters.length} ESCAPE '\\'`;
    }

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

    const havingClause = isDefined(statusesFilter)
      ? `HAVING ${buildCoreWorkflowStatusesHavingClause(statusesFilter)}`
      : '';

    parameters.push(first + 1);
    const limitParameter = `$${parameters.length}`;

    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         ${cursorExpression} AS "cursorSortValue",
         c.name,
         c."applicationId",
         min(wf.id::text) AS "workspaceWorkflowId",
         c."updatedAt",
         coalesce(bool_or(v.status = 'DRAFT'), false) AS "hasDraftVersion",
         coalesce(bool_or(v.status = 'ACTIVE'), false) AS "hasActiveVersion",
         coalesce(bool_or(v.status = 'DEACTIVATED'), false) AS "hasDeactivatedVersion"
       FROM core."workflow" c
       LEFT JOIN ${schemaName}."workflow" wf
         ON wf."coreWorkflowId" = c.id AND wf."deletedAt" IS NULL
       LEFT JOIN core."workflowVersion" v
         ON v."workflowId" = wf.id AND v."workspaceId" = $1
       WHERE c."workspaceId" = $1
       ${searchCondition}
       ${keysetCondition}
       GROUP BY c.id, c.name, c."applicationId", c."updatedAt"
       ${havingClause}
       ORDER BY ${column} ${direction}${nullsClause}, c.id ${direction}
       LIMIT ${limitParameter}`,
      parameters,
    );

    const totalCount = await this.countByWorkspaceId({
      workspaceId,
      schemaName,
      searchPattern,
      statuses: statusesFilter,
    });

    const hasNextPage = rows.length > first;
    const pageRows = hasNextPage ? rows.slice(0, first) : rows;

    const edges = pageRows.map((row) => ({
      node: {
        id: row.id,
        name: row.name,
        statuses: computeCoreWorkflowStatuses({
          hasDraftVersion: row.hasDraftVersion,
          hasActiveVersion: row.hasActiveVersion,
          hasDeactivatedVersion: row.hasDeactivatedVersion,
        }),
        applicationId: row.applicationId,
        workspaceWorkflowId: row.workspaceWorkflowId,
        updatedAt: row.updatedAt.toISOString(),
      },
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

  private async countByWorkspaceId({
    workspaceId,
    schemaName,
    searchPattern,
    statuses,
  }: {
    workspaceId: string;
    schemaName: string;
    searchPattern?: string;
    statuses?: CoreWorkflowStatus[];
  }): Promise<number> {
    const parameters: unknown[] = [workspaceId];
    let searchCondition = '';

    if (isDefined(searchPattern)) {
      parameters.push(searchPattern);
      searchCondition = `AND c.name ILIKE $${parameters.length} ESCAPE '\\'`;
    }

    if (!isDefined(statuses)) {
      const [{ totalCount }]: [{ totalCount: number }] =
        await this.coreDataSource.query(
          `SELECT count(*)::int AS "totalCount"
           FROM core."workflow" c
           WHERE c."workspaceId" = $1
           ${searchCondition}`,
          parameters,
        );

      return totalCount;
    }

    // the statuses filter is a HAVING clause over aggregated versions, so the
    // filtered count needs the same joined and grouped shape as the page query
    const [{ totalCount }]: [{ totalCount: number }] =
      await this.coreDataSource.query(
        `SELECT count(*)::int AS "totalCount"
         FROM (
           SELECT c.id
           FROM core."workflow" c
           LEFT JOIN ${schemaName}."workflow" wf
             ON wf."coreWorkflowId" = c.id AND wf."deletedAt" IS NULL
           LEFT JOIN core."workflowVersion" v
             ON v."workflowId" = wf.id AND v."workspaceId" = $1
           WHERE c."workspaceId" = $1
           ${searchCondition}
           GROUP BY c.id
           HAVING ${buildCoreWorkflowStatusesHavingClause(statuses)}
         ) filtered`,
        parameters,
      );

    return totalCount;
  }
}
