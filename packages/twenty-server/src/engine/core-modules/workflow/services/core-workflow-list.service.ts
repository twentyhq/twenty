import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
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
    const schemaName = getWorkspaceSchemaName(workspaceId);

    // core.workflowVersion.workflowId holds the WORKSPACE workflow id, so the
    // status has to be resolved through the workspace row rather than joined
    // directly on core.workflow.id
    const rows: CoreWorkflowRow[] = await this.coreDataSource.query(
      `SELECT
         c.id,
         c.name,
         app.name AS "applicationName",
         wf.id AS "workspaceWorkflowId",
         c."updatedAt",
         bool_or(v.status = 'ACTIVE') AS "hasActiveVersion",
         bool_or(v.status = 'DRAFT') AS "hasDraftVersion"
       FROM core."workflow" c
       LEFT JOIN "${schemaName}"."workflow" wf
         ON wf."coreWorkflowId" = c.id AND wf."deletedAt" IS NULL
       LEFT JOIN core."workflowVersion" v
         ON v."workflowId" = wf.id AND v."workspaceId" = $1
       LEFT JOIN core."application" app
         ON app.id = c."applicationId"
       WHERE c."workspaceId" = $1
       GROUP BY c.id, c.name, app.name, wf.id, c."updatedAt"
       ORDER BY c."updatedAt" DESC`,
      [workspaceId],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.hasActiveVersion
        ? 'ACTIVE'
        : row.hasDraftVersion
          ? 'DRAFT'
          : 'DEACTIVATED',
      applicationName: row.applicationName,
      workspaceWorkflowId: row.workspaceWorkflowId,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }
}
