import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickhouse.service';
import {
  AnalyticsException,
  AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import {
  TrackEventName,
  TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import {
  makePageview,
  makeTrackEvent,
} from 'src/engine/core-modules/audit/utils/analytics.utils';
import { PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly clickHouseService: ClickHouseService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
          this.clickHouseService.insert('auditEvent', [
            { ...userIdAndWorkspaceId, ...makeTrackEvent(event, properties) },
          ]),
        ),
      pageview: (name: string, properties: Partial<PageviewProperties>) =>
        this.preventAnalyticsIfDisabled(() =>
          this.clickHouseService.insert('pageview', [
            { ...userIdAndWorkspaceId, ...makePageview(name, properties) },
          ]),
        ),
    };
  }

  private async pushEvent(
    data: (
      | ReturnType<typeof makeTrackEvent>
      | ReturnType<typeof makePageview>
    ) & { userId?: string | null; workspaceId?: string | null },
  ) {
    const { type, ...rest } = data;

    return await this.clickHouseService.insert(
      type === 'page' ? 'pageview' : 'auditEvent',
      [rest],
    );
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
      return new AnalyticsException(err, AuditExceptionCode.INVALID_INPUT);
    }
  }
}
