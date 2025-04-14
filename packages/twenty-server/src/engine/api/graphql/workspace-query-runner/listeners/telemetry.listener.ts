import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TelemetryService } from 'src/engine/core-modules/telemetry/telemetry.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { WORKSPACE_ENTITY_CREATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/workspace-entity/workspace-entity-created';
import { USER_SIGNUP_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/user/user-signup';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';

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
        this.analyticsService
          .createAnalyticsContext({
            userId: eventPayload.userId,
            workspaceId: payload.workspaceId,
          })
          .track(WORKSPACE_ENTITY_CREATED_EVENT, {
            name: payload.name,
          }),
      ),
    );
  }

  @OnCustomBatchEvent(USER_SIGNUP_EVENT_NAME)
  async handleUserSignup(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    await Promise.all(
      payload.events.map(async (eventPayload) => {
        this.analyticsService
          .createAnalyticsContext({
            userId: eventPayload.userId,
            workspaceId: payload.workspaceId,
          })
          .track(USER_SIGNUP_EVENT);

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
