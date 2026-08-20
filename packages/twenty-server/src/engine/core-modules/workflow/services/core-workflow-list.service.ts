import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  type CoreWorkflowsArgs,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type CoreWorkflowRow = {
  id: string;
  sortValue: string;
  name: string | null;
  applicationId: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: Date;
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
};

type CoreWorkflowCursor = {
  sortValue: string;
  id: string;
};

// nulls are coalesced away so the keyset comparison never meets a NULL
const SORT_EXPRESSION_BY_FIELD: Record<CoreWorkflowOrderByField, string> = {
  [CoreWorkflowOrderByField.NAME]: `coalesce(c.name, '')`,
  [CoreWorkflowOrderByField.UPDATED_AT]: `to_char(c."updatedAt" at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')`,
};

@Injectable()
export class CoreWorkflowListService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async findManyByWorkspaceId(
    workspaceId: string,
    { first, after, orderBy, orderByDirection }: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const sortExpression = SORT_EXPRESSION_BY_FIELD[orderBy];
    const comparator =
      orderByDirection === CoreWorkflowOrderByDirection.ASC ? '>' : '<';
    const direction =
      orderByDirection === CoreWorkflowOrderByDirection.ASC ? 'ASC' : 'DESC';

    const parameters: unknown[] = [workspaceId];
    let keysetCondition = '';

    if (after !== undefined) {
      const cursor = decodeCursor<CoreWorkflowCursor>(after);

      parameters.push(cursor.sortValue, cursor.id);
      keysetCondition = `AND (${sortExpression}, c.id::text) ${comparator} ($2, $3)`;
    }

    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         ${sortExpression} AS "sortValue",
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
       ${keysetCondition}
       GROUP BY c.id, c.name, c."applicationId", c."updatedAt"
       ORDER BY ${sortExpression} ${direction}, c.id::text ${direction}
       LIMIT ${first + 1}`,
      parameters,
    );

    const [{ totalCount }]: [{ totalCount: number }] =
      await this.coreDataSource.query(
        `SELECT count(*)::int AS "totalCount"
         FROM core."workflow" c
         WHERE c."workspaceId" = $1`,
        [workspaceId],
      );

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
        sortValue: row.sortValue,
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
}
