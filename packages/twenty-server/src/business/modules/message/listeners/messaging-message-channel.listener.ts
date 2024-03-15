import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/integrations/event-emitter/utils/object-record-changed-properties.util';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  CreateCompaniesAndContactsAfterSyncJobData,
  CreateCompaniesAndContactsAfterSyncJob,
} from 'src/business/modules/message/jobs/create-companies-and-contacts-after-sync.job';
import { MessageChannelObjectMetadata } from 'src/business/modules/message/message-channel.object-metadata';

@Injectable()
export class MessagingMessageChannelListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.updated')
  handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<MessageChannelObjectMetadata>,
  ) {
    if (
      objectRecordChangedProperties(
        payload.previousRecord,
        payload.updatedRecord,
      ).includes('isContactAutoCreationEnabled') &&
      payload.updatedRecord.isContactAutoCreationEnabled
    ) {
      this.messageQueueService.add<CreateCompaniesAndContactsAfterSyncJobData>(
        CreateCompaniesAndContactsAfterSyncJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelId: payload.updatedRecord.id,
        },
      );
    }
  }
}
