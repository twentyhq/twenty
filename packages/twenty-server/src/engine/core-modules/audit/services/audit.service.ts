import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
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
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly clickHouseService: ClickHouseService,
  ) {}

  createContext(context?: {
    workspaceId?: string | null | undefined;
    userId?: string | null | undefined;
  }) {
    const contextFields = context
      ? {
          ...(context.workspaceId ? { workspaceId: context.workspaceId } : {}),
          ...(context.userId ? { userId: context.userId } : {}),
        }
      : {};

    return {
      insertWorkspaceEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) =>
        this.preventIfDisabled(() =>
          this.clickHouseService.insert('workspaceEvent', [
            { ...contextFields, ...makeTrackEvent(event, properties) },
          ]),
        ),
      createObjectEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T> & {
          recordId: string;
          objectMetadataId: string;
          isCustom?: boolean;
        },
      ) => {
        const { recordId, objectMetadataId, isCustom, ...restProperties } =
          properties;

        return this.preventIfDisabled(() =>
          this.clickHouseService.insert('objectEvent', [
            {
              ...contextFields,
              ...makeTrackEvent(
                event,
                restProperties as unknown as TrackEventProperties<T>,
              ),
              recordId,
              objectMetadataId,
              isCustom,
            },
          ]),
        );
      },
      createPageviewEvent: (
        name: string,
        properties: Partial<PageviewProperties>,
      ) =>
        this.preventIfDisabled(() =>
          this.clickHouseService.insert('pageview', [
            { ...contextFields, ...makePageview(name, properties) },
          ]),
        ),
    };
  }

  private async preventIfDisabled(
    sendEventOrPageviewFunction: () => Promise<{ success: boolean }>,
  ): Promise<{ success: boolean }> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return { success: true };
    }

    try {
      return await sendEventOrPageviewFunction();
    } catch (error) {
      this.logger.error('Failed to persist audit event to ClickHouse', error);

      return { success: false };
    }
  }
}
