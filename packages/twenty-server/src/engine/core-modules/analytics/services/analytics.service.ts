import { Injectable } from '@nestjs/common';

import { makePageview, makeEvent } from 'twenty-analytics';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly clickhouseService: ClickhouseService,
  ) {}

  async create(
    createEventInput: CreateEventInput,
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    return this.clickhouseService.insert(
      createEventInput.action === 'pageview'
        ? makePageview({
            userId: userId,
            workspaceId: workspaceId,
            ...createEventInput.payload,
          })
        : makeEvent({
            action: createEventInput.action,
            userId: userId,
            workspaceId: workspaceId,
            payload: JSON.stringify(createEventInput.payload),
          }),
    );
  }
}
