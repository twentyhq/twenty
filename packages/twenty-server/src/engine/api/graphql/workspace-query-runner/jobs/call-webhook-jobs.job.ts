import { Logger } from '@nestjs/common';

import { ArrayContains } from 'typeorm';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  CallWebhookJob,
  CallWebhookJobData,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';

export type CallWebhookJobsJobData = {
  workspaceId: string;
  objectMetadataItem: ObjectMetadataInterface;
  record: ObjectRecordBaseEvent;
  eventName: string;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(data: CallWebhookJobsJobData): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts

    const webhookRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
        data.workspaceId,
        'webhook',
      );

    const [nameSingular, operation] = data.eventName.split('.');

    const webhooks = await webhookRepository.find({
      where: [
        { operations: ArrayContains([data.eventName]) },
        { operations: ArrayContains([`*.${operation}`]) },
        { operations: ArrayContains([`${nameSingular}.*`]) },
        { operations: ArrayContains(['*.*']) },
      ],
    });

    let formattedRecord = {};

    if (operation === DatabaseEventAction.CREATED) {
      formattedRecord = (data.record as ObjectRecordCreateEvent<any>).properties
        .after;
    } else if (operation === DatabaseEventAction.UPDATED) {
      formattedRecord = (
        data.record as ObjectRecordUpdateEvent<any>
      ).properties.diff?.reduce(
        (acc, [key, value]) => {
          acc[key] = value.after;

          return acc;
        },
        { id: data.record.recordId },
      );
    } else if (
      [DatabaseEventAction.DELETED, DatabaseEventAction.DESTROYED].includes(
        operation as DatabaseEventAction,
      )
    ) {
      formattedRecord = {
        id: data.record.recordId,
      };
    } else {
      throw new Error(
        `operation '${operation}' invalid for webhook event ${data.eventName}`,
      );
    }

    webhooks.forEach((webhook) => {
      this.messageQueueService.add<CallWebhookJobData>(
        CallWebhookJob.name,
        {
          targetUrl: webhook.targetUrl,
          eventName: data.eventName,
          objectMetadata: {
            id: data.objectMetadataItem.id,
            nameSingular: data.objectMetadataItem.nameSingular,
          },
          workspaceId: data.workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          record: formattedRecord,
        },
        { retryLimit: 3 },
      );
    });

    webhooks.length > 0 &&
      this.logger.log(
        `CallWebhookJobsJob on eventName '${data.eventName}' triggered webhooks with ids [\n"${webhooks.map((webhook) => webhook.id).join('",\n"')}"\n]`,
      );
  }
}
