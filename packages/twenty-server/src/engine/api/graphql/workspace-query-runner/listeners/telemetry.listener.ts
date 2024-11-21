import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TelemetryService } from 'src/engine/core-modules/telemetry/telemetry.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';

@Injectable()
export class TelemetryListener {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleAllCreate(payload: WorkspaceEventBatch<ObjectRecordCreateEvent>) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.analyticsService.create(
          {
            action: payload.name,
            payload: {},
          },
          eventPayload.userId,
          payload.workspaceId,
        ),
      ),
    );
  }

  @OnCustomBatchEvent(USER_SIGNUP_EVENT_NAME)
  async handleUserSignup(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    await Promise.all(
      payload.events.map(async (eventPayload) => {
        this.analyticsService.create(
          {
            action: USER_SIGNUP_EVENT_NAME,
            payload: {},
          },
          eventPayload.userId,
          payload.workspaceId,
        );

        this.telemetryService.create(
          {
            action: USER_SIGNUP_EVENT_NAME,
            payload: {
              payload,
              userId: undefined,
              workspaceId: undefined,
            },
          },
          eventPayload.userId,
          payload.workspaceId,
        );
      }),
    );
  }
}
