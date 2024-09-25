import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';

@Injectable()
export class TelemetryListener {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @OnEvent('*.created')
  async handleAllCreate(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<any>>,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.analyticsService.create(
          {
            action: payload.name,
            payload: {}
          },
          eventPayload.userId,
          payload.workspaceId,
        ),
      ),
    );
  }

  @OnEvent('user.signup')
  async handleUserSignup(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<any>>,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.analyticsService.create(
          {
            action: 'user.signup',
            payload: {}
          },
          eventPayload.userId,
          payload.workspaceId,
        ),
      ),
    );
  }
}
