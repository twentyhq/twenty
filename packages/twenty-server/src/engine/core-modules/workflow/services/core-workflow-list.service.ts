import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { computeCoreWorkflowStatus } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-status.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type CoreWorkflowRow = {
  id: string;
  name: string | null;
  applicationName: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: Date;
  hasActiveVersion: boolean;
  hasDraftVersion: boolean;
};

@Injectable()
export class CoreWorkflowListService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async findManyByWorkspaceId(workspaceId: string): Promise<CoreWorkflowDTO[]> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         c.name,
         app.name AS "applicationName",
         min(wf.id::text) AS "workspaceWorkflowId",
         c."updatedAt",
         coalesce(bool_or(v.status = 'ACTIVE'), false) AS "hasActiveVersion",
         coalesce(bool_or(v.status = 'DRAFT'), false) AS "hasDraftVersion"
       FROM core."workflow" c
       LEFT JOIN ${schemaName}."workflow" wf
         ON wf."coreWorkflowId" = c.id AND wf."deletedAt" IS NULL
       LEFT JOIN core."workflowVersion" v
         ON v."workflowId" = wf.id AND v."workspaceId" = $1
       LEFT JOIN core."application" app
         ON app.id = c."applicationId"
       WHERE c."workspaceId" = $1
       GROUP BY c.id, c.name, app.name, c."updatedAt"
       ORDER BY c."updatedAt" DESC`,
      [workspaceId],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: computeCoreWorkflowStatus({
        hasActiveVersion: row.hasActiveVersion,
        hasDraftVersion: row.hasDraftVersion,
      }),
      applicationName: row.applicationName,
      workspaceWorkflowId: row.workspaceWorkflowId,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }
}
