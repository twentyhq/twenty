/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { buildUsageEventEnvelopes } from 'src/engine/core-modules/usage/utils/build-usage-event-envelopes';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class UsageEventListener {
  private readonly logger = new Logger(UsageEventListener.name);

  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
  ) {}

  @OnCustomBatchEvent(USAGE_RECORDED)
  async handleUsageRecordedEvent(
    payload: CustomWorkspaceEventBatch<UsageEvent>,
  ): Promise<void> {
    if (
      !isDefined(payload.workspaceId) ||
      !this.eventLogEmitterService.isEnabled()
    ) {
      return;
    }

    try {
      await this.eventLogEmitterService.dispatch(
        buildUsageEventEnvelopes(payload.workspaceId, payload.events),
      );
    } catch (error) {
      // Usage analytics is best-effort; never fail the emitting flow.
      this.logger.error('Failed to record usage events', error);
    }
  }
}
