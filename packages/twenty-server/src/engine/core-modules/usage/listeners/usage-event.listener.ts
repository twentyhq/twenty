/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEventsConsumer } from 'src/engine/core-modules/audit/jobs/workspace-events.consumer';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventsJobData } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { buildUsageEventEnvelopes } from 'src/engine/core-modules/usage/utils/build-usage-event-envelopes';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class UsageEventListener {
  constructor(
    @InjectMessageQueue(MessageQueue.workspaceEventsQueue)
    private readonly workspaceEventsQueueService: MessageQueueService,
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  @OnCustomBatchEvent(USAGE_RECORDED)
  async handleUsageRecordedEvent(
    payload: CustomWorkspaceEventBatch<UsageEvent>,
  ): Promise<void> {
    if (
      !isDefined(payload.workspaceId) ||
      !this.workspaceEventSinkService.isEnabled()
    ) {
      return;
    }

    await this.workspaceEventsQueueService.add<WorkspaceEventsJobData>(
      WorkspaceEventsConsumer.name,
      {
        events: buildUsageEventEnvelopes(payload.workspaceId, payload.events),
      },
    );
  }
}
