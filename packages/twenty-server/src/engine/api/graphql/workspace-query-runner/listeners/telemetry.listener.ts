import { Injectable } from '@nestjs/common';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { TelemetryEventType } from 'src/engine/core-modules/telemetry/telemetry-event.type';
import { TelemetryService } from 'src/engine/core-modules/telemetry/telemetry.service';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class TelemetryListener {
  constructor(private readonly telemetryService: TelemetryService) {}

  @OnCustomBatchEvent(USER_SIGNUP_EVENT_NAME)
  async handleUserSignup(
    payload: CustomWorkspaceEventBatch<TelemetryEventType>,
  ) {
    await this.telemetryService.publish({
      action: USER_SIGNUP_EVENT_NAME,
      events: payload.events,
    });
  }
}
