import { Injectable } from '@nestjs/common';

import {
  makePageview,
  makeUnsafeEvent,
  Event as AnalyticsEvent,
  Pageview as AnalyticsPageview,
} from 'twenty-analytics';

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

  // @deprecated - use createAnalyticsContext
  async create(
    createEventInput: CreateEventInput,
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    return this.clickhouseService.insert(
      createEventInput.action === 'pageview'
        ? makePageview({
            ...createEventInput.payload,
            userId: userId,
            workspaceId: workspaceId,
          })
        : makeUnsafeEvent({
            action: createEventInput.action,
            payload: createEventInput.payload,
            userId: userId,
            workspaceId: workspaceId,
          }),
    );
  }

  createAnalyticsContext(
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    return {
      sendEvent: (data: AnalyticsEvent) =>
        this.sendEvent({
          ...data,
          ...(userId ? { userId } : {}),
          ...(workspaceId ? { workspaceId } : {}),
        }),
      sendPageview: (data: AnalyticsPageview) =>
        this.sendPageview({
          ...data,
          ...(userId ? { userId } : {}),
          ...(workspaceId ? { workspaceId } : {}),
        }),
    };
  }

  private async sendEvent(data: AnalyticsEvent) {
    return this.clickhouseService.insert(data);
  }

  private async sendPageview(data: AnalyticsPageview) {
    return this.clickhouseService.insert(data);
  }
}
