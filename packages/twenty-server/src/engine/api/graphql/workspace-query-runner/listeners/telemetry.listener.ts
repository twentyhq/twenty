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
            type: 'track',
            data: {
              eventName: payload.name,
            },
          },
          eventPayload.userId,
          payload.workspaceId,
          '', // voluntarily not retrieving this
          '', // to avoid slowing down
          this.environmentService.get('SERVER_URL'),
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
            type: 'track',
            data: {
              eventName: 'user.signup',
            },
          },
          eventPayload.userId,
          payload.workspaceId,
          '',
          '',
          this.environmentService.get('SERVER_URL'),
        ),
      ),
    );
  }
}
