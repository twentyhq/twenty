import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { DataSourceService } from 'src/engine-metadata/data-source/data-source.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

export type SaveEventToDbJobData = {
  workspaceId: string;
  recordId: string;
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
    // TODO: need to support objects others than "person", "company", "opportunities"

    if (
      data.objectName != 'person' &&
      data.objectName != 'company' &&
      data.objectName != 'opportunities'
    ) {
      return;
    }

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."event"
      ("name", "properties", "${data.objectName}Id")
      VALUES ('${eventType}', '${JSON.stringify(data.details)}', '${
        data.recordId
      }') RETURNING *`,
    );
  }
}
