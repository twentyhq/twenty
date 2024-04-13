import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import {
  SaveEventToDbJobData,
  SaveEventToDbJob,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/save-event-to-db.job';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { objectRecordChangedValues } from 'src/engine/integrations/event-emitter/utils/object-record-changed-values';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';

@Injectable()
export class EntityEventsToDbListener {
  constructor(
    @Inject(MessageQueue.entityEventsToDbQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @OnEvent('*.created')
  async handleCreate(payload: ObjectRecordCreateEvent<any>) {
    return this.handle(payload, 'created');
  }

  @OnEvent('*.updated')
  async handleUpdate(payload: ObjectRecordUpdateEvent<any>) {
    payload.details.diff = objectRecordChangedValues(
      payload.details.before,
      payload.details.after,
    );

    return this.handle(payload, 'updated');
  }

  // @OnEvent('*.deleted') - TODO: implement when we have soft deleted
  // ....

  private async handle(
    payload: ObjectRecordCreateEvent<any>,
    operation: string,
  ) {
      
    if (!payload.objectMetadata.isAuditLogged) {
      return;
    }

    const isEventObjectEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: payload.workspaceId,
        key: FeatureFlagKeys.IsEventObjectEnabled,
        value: true,
      });

    if (
      !isEventObjectEnabledFeatureFlag ||
      !isEventObjectEnabledFeatureFlag.value
    ) {
      return;
    }

    this.messageQueueService.add<SaveEventToDbJobData>(SaveEventToDbJob.name, {
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      recordId: payload.recordId,
      objectName: payload.objectMetadata.nameSingular,
      operation: operation,
      details: payload.details,
    });
  }
}
