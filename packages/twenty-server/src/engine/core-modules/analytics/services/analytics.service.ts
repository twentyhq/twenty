import { Injectable } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  KnownAnalyticsEventMap,
} from 'src/engine/core-modules/analytics/types/event.type';
import { AnalyticsPageview as AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import {
  makeEvent,
  makeUnknownEvent,
} from 'src/engine/core-modules/analytics/utils/analytics.utils';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly clickhouseService: ClickhouseService,
  ) {}

  createAnalyticsContext(context?: {
    workspaceId?: string | null | undefined;
    userId?: string | null | undefined;
  }) {
    const userIdAndWorkspaceId = context
      ? {
          ...('userId' in context ? { userId: context.userId } : {}),
          ...('workspaceId' in context
            ? { workspaceId: context.workspaceId }
            : {}),
        }
      : {};

    return {
      sendUnknownEvent: (data: Record<string, unknown>) =>
        this.preventAnalyticsIfDisabled(() =>
          this.sendEvent(
            makeUnknownEvent({
              ...data,
              ...userIdAndWorkspaceId,
            }),
          ),
        ),
      sendEvent: <T extends keyof KnownAnalyticsEventMap>(
        data: AnalyticsEventType<T>,
      ) =>
        this.preventAnalyticsIfDisabled(() =>
          this.sendEvent(
            makeEvent({
              ...data,
              ...userIdAndWorkspaceId,
            }),
          ),
        ),
      sendPageview: (data: AnalyticsPageview) =>
        this.preventAnalyticsIfDisabled(() =>
          this.sendPageview({
            ...data,
            ...userIdAndWorkspaceId,
          }),
        ),
    };
  }

  private preventAnalyticsIfDisabled(
    sendEventOrPageviewFunction: () => Promise<{ success: boolean }>,
  ) {
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    return sendEventOrPageviewFunction();
  }

  // use the method makeEvent to create data params
  private async sendEvent(data: AnalyticsEvent) {
    return this.clickhouseService.insert(data);
  }

  // use the method makePageview to create data params
  private async sendPageview(data: AnalyticsPageview) {
    return this.clickhouseService.insert(data);
  }
}
