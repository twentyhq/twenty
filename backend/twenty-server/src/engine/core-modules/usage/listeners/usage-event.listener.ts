/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageEventWriterService } from 'src/engine/core-modules/usage/services/usage-event-writer.service';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class UsageEventListener {
  constructor(
    private readonly usageEventWriterService: UsageEventWriterService,
  ) {}

  @OnCustomBatchEvent(USAGE_RECORDED)
  handleUsageRecordedEvent(payload: CustomWorkspaceEventBatch<UsageEvent>) {
    if (!isDefined(payload.workspaceId)) {
      return;
    }

    this.usageEventWriterService.writeToClickHouse(
      payload.workspaceId,
      payload.events,
    );
  }
}
