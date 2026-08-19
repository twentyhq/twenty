import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type CoreWorkflowRow = {
  id: string;
  name: string | null;
  applicationId: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: Date;
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
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
       GROUP BY c.id, c.name, c."applicationId", c."updatedAt"
       ORDER BY c."updatedAt" DESC`,
      [workspaceId],
    );

    return rows.map((row) => ({
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
    }));
  }
}
