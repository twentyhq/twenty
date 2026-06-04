/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { buildUsageEventEnvelopes } from 'src/engine/core-modules/usage/utils/build-usage-event-envelopes';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class UsageEventListener {
  private readonly logger = new Logger(UsageEventListener.name);

  constructor(
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

    try {
      await this.workspaceEventSinkService.enqueue(
        buildUsageEventEnvelopes(payload.workspaceId, payload.events),
      );
    } catch (error) {
      // Usage analytics is best-effort; never fail the emitting flow.
      this.logger.error('Failed to enqueue usage events', error);
    }
  }
}
