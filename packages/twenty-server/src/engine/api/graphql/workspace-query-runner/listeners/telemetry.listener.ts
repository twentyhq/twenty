import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';

@Injectable()
export class TelemetryListener {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @OnEvent('*.created')
  async handleAllCreate(payload: ObjectRecordCreateEvent<any>[]) {
    await Promise.all(
      payload.map((eventPayload) =>
        this.analyticsService.create(
          {
            type: 'track',
            data: {
              eventName: eventPayload.name,
            },
          },
          eventPayload.userId,
          eventPayload.workspaceId,
          '', // voluntarily not retrieving this
          '', // to avoid slowing down
          this.environmentService.get('SERVER_URL'),
        ),
      ),
    );
  }

  @OnEvent('user.signup')
  async handleUserSignup(payload: ObjectRecordCreateEvent<any>[]) {
    await Promise.all(
      payload.map(async (eventPayload) =>
        this.analyticsService.create(
          {
            type: 'track',
            data: {
              eventName: 'user.signup',
            },
          },
          eventPayload.userId,
          eventPayload.workspaceId,
          '',
          '',
          this.environmentService.get('SERVER_URL'),
        ),
      ),
    );
  }
}
