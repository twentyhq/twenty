import { Injectable } from '@nestjs/common';

import {
  AnalyticsException,
  AnalyticsExceptionCode,
} from 'src/engine/core-modules/audit/analytics.exception';
import { ClickhouseService } from 'src/engine/core-modules/audit/services/clickhouse.service';
import {
  TrackEventName,
  TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import {
  makePageview,
  makeTrackEvent,
} from 'src/engine/core-modules/audit/utils/analytics.utils';
import { PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';
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
      track: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) =>
        this.preventAnalyticsIfDisabled(() =>
          this.clickhouseService.pushEvent({
            ...userIdAndWorkspaceId,
            ...makeTrackEvent(event, properties),
          }),
        ),
      pageview: (name: string, properties: Partial<PageviewProperties>) =>
        this.preventAnalyticsIfDisabled(() =>
          this.clickhouseService.pushEvent({
            ...userIdAndWorkspaceId,
            ...makePageview(name, properties),
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
    try {
      return sendEventOrPageviewFunction();
    } catch (err) {
      return new AnalyticsException(err, AnalyticsExceptionCode.INVALID_INPUT);
    }
  }
}
