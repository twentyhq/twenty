import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import {
  AuditException,
  AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import {
  makePageview,
  makeTrackEvent,
} from 'src/engine/core-modules/audit/utils/analytics.utils';
import { type PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AuditService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly clickHouseService: ClickHouseService,
  ) {}

  createContext(context?: {
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
      insertWorkspaceEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) =>
        this.preventIfDisabled(() =>
          this.clickHouseService.insert('workspaceEvent', [
            { ...userIdAndWorkspaceId, ...makeTrackEvent(event, properties) },
          ]),
        ),
      createObjectEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T> & {
          recordId: string;
          objectMetadataId: string;
        },
      ) =>
        this.preventIfDisabled(() =>
          this.clickHouseService.insert('objectEvent', [
            { ...userIdAndWorkspaceId, ...makeTrackEvent(event, properties) },
          ]),
        ),
      createPageviewEvent: (
        name: string,
        properties: Partial<PageviewProperties>,
      ) =>
        this.preventIfDisabled(() =>
          this.clickHouseService.insert('pageview', [
            { ...userIdAndWorkspaceId, ...makePageview(name, properties) },
          ]),
        ),
    };
  }

  private preventIfDisabled(
    sendEventOrPageviewFunction: () => Promise<{ success: boolean }>,
  ) {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return { success: true };
    }
    try {
      return sendEventOrPageviewFunction();
    } catch (err) {
      return new AuditException(err, AuditExceptionCode.INVALID_INPUT);
    }
  }
}
