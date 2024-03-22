import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

export type SaveEventToDbJobData = {
  workspaceId: string;
  recordId: string;
  userId: string | undefined;
  objectName: string;
  operation: string;
  details: any;
};

@Injectable()
export class SaveEventToDbJob implements MessageQueueJob<SaveEventToDbJobData> {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async handle(data: SaveEventToDbJobData): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        data.workspaceId,
      );
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        data.workspaceId,
      );

    const eventType = `${data.operation}.${data.objectName}`;

    // TODO: add "workspaceMember" (who performed the action, need to send it in the event)
    // TODO: need to support objects others than "person", "company", "opportunity"

    if (
      data.objectName != 'person' &&
      data.objectName != 'company' &&
      data.objectName != 'opportunity'
    ) {
      return;
    }

    if (data.details.diff) {
      data.details = {
        diff: data.details.diff,
      };
    }

    const workspaceMember = await workspaceDataSource?.query(`
      SELECT "id" FROM ${dataSourceMetadata.schema}."workspaceMember"
      WHERE ("userId" = '${data.userId}') LIMIT 1;
  `);

    const workspaceMemberId = workspaceMember[0]?.id ?? null;

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."event"
      ("name", "properties", "${data.objectName}Id", "workspaceMemberId")
      VALUES ('${eventType}','${JSON.stringify(data.details)}', '${
        data.recordId
      }', '${workspaceMemberId}') RETURNING *`,
    );
  }
}
