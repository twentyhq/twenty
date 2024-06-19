import { Logger } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import {
  CallWebhookJob,
  CallWebhookJobData,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export enum CallWebhookJobsJobOperation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type CallWebhookJobsJobData = {
  workspaceId: string;
  objectMetadataItem: ObjectMetadataInterface;
  record: any;
  operation: CallWebhookJobsJobOperation;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly dataSourceService: DataSourceService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(data: CallWebhookJobsJobData): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        data.workspaceId,
      );
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        data.workspaceId,
      );
    const nameSingular = data.objectMetadataItem.nameSingular;
    const operation = data.operation;
    const eventType = `${operation}.${nameSingular}`;
    const webhooks: { id: string; targetUrl: string }[] =
      await workspaceDataSource?.query(
        `
            SELECT * FROM ${dataSourceMetadata.schema}."webhook" 
            WHERE operation LIKE '%${eventType}%' 
            OR operation LIKE '%*.${nameSingular}%' 
            OR operation LIKE '%${operation}.*%'
            OR operation LIKE '%*.*%'
          `,
      );

    webhooks.forEach((webhook) => {
      this.messageQueueService.add<CallWebhookJobData>(
        CallWebhookJob.name,
        {
          targetUrl: webhook.targetUrl,
          eventType,
          objectMetadata: {
            id: data.objectMetadataItem.id,
            nameSingular: data.objectMetadataItem.nameSingular,
          },
          workspaceId: data.workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          record: data.record,
        },
        { retryLimit: 3 },
      );
    });

    if (webhooks.length) {
      this.logger.log(
        `CallWebhookJobsJob on eventType '${eventType}' called on webhooks ids [\n"${webhooks
          .map((webhook) => webhook.id)
          .join('",\n"')}"\n]`,
      );
    }
  }
}
