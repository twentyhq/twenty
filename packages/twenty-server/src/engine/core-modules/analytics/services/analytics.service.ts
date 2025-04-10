import { Injectable } from '@nestjs/common';

import {
  AnalyticsEvent,
  AnalyticsEventType,
  KnownAnalyticsEventMap,
  UnknownAnalyticsEvent,
} from 'src/engine/core-modules/analytics/types/event.type';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import {
  makeEvent,
  makeUnknownEvent,
} from 'src/engine/core-modules/analytics/utils/analytics.utils';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
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
      sendUnknownEvent: (data: UnknownAnalyticsEvent) =>
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
    if (!this.twentyConfigService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    return sendEventOrPageviewFunction();
  }

  private async sendEvent(data: AnalyticsEvent) {
    return this.clickhouseService.pushEvent(data);
  }

  private async sendPageview(data: AnalyticsPageview) {
    return this.clickhouseService.pushEvent(data);
  }
}
