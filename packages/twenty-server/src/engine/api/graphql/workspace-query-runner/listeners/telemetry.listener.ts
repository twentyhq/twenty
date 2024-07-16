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
  async handleAllCreate(payload: ObjectRecordCreateEvent<any>) {
    await this.analyticsService.create(
      {
        type: 'track',
        data: {
          eventName: payload.name,
        },
      },
      payload.userId,
      payload.workspaceId,
      '', // voluntarely not retrieving this
      '', // to avoid slowing down
      this.environmentService.get('SERVER_URL'),
    );
  }

  @OnEvent('user.signup')
  async handleUserSignup(payload: ObjectRecordCreateEvent<any>) {
    await this.analyticsService.create(
      {
        type: 'track',
        data: {
          eventName: 'user.signup',
        },
      },
      payload.userId,
      payload.workspaceId,
      '',
      '',
      this.environmentService.get('SERVER_URL'),
    );
  }
}
