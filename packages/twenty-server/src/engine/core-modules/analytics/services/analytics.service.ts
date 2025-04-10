import { Injectable } from '@nestjs/common';

import {
  makeTrackEvent,
  makePageview,
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
          ...(context.userId ? { userId: context.userId } : {}),
          ...(context.workspaceId ? { workspaceId: context.workspaceId } : {}),
        }
      : {};

    return {
      track: (event: string, properties: object) =>
        this.preventAnalyticsIfDisabled(() =>
          this.trackEvent(
            makeTrackEvent(event, { ...properties, ...userIdAndWorkspaceId }),
          ),
        ),
      pageview: (name: string, properties: object) =>
        this.preventAnalyticsIfDisabled(() =>
          this.trackPageview(
            makePageview(name, { ...properties, ...userIdAndWorkspaceId }),
          ),
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

  private async trackEvent(data: ReturnType<typeof makeTrackEvent>) {
    return this.clickhouseService.pushEvent(data);
  }

  private async trackPageview(data: ReturnType<typeof makePageview>) {
    return this.clickhouseService.pushEvent(data);
  }
}
