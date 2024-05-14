import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { CreateAnalyticsInput } from 'src/engine/core-modules/analytics/dto/create-analytics.input';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';

@Injectable()
export class TelemetryListener {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @OnEvent('*.created')
  async handleAllCreate(payload: ObjectRecordCreateEvent<any>) {
    this.analyticsService.create(
      {
        type: 'track',
        name: payload.name,
        data: JSON.parse(`{
          "eventName": "${payload.name}"
        }`),
      } as CreateAnalyticsInput,
      payload.userId,
      payload.workspaceId,
      '', // voluntarely not retrieving this
      '', // to avoid slowing down
      '',
    );
  }
}
