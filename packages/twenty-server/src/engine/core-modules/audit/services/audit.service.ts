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
import { RedisFieldRepository } from 'src/engine/twenty-orm/repository/redis-fields.repository';
import { OBJECT_RECORD_VIEWED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-viewed';
import { redisKeyBuilder } from 'src/engine/twenty-orm/utils/redis-key-builder.util';

@Injectable()
export class AuditService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly clickHouseService: ClickHouseService,
    private readonly redisFieldRepository: RedisFieldRepository,
  ) {}

  private async writeEventInRedis({
    userId,
    workspaceId,
    objectMetadataId,
    recordId,
  }: TrackEventProperties<typeof OBJECT_RECORD_VIEWED_EVENT> & {
    userId?: string;
    workspaceId?: string;
  }) {
    if (!userId || !workspaceId || !objectMetadataId || !recordId) {
      return new AuditException(
        `Properties missing: userId, workspaceId, objectMetadataId, recordId are required`,
        AuditExceptionCode.INVALID_INPUT,
      );
    }

    const key = redisKeyBuilder({
      workspaceId,
      userId,
      objectMetadataId,
    });

    await this.redisFieldRepository.setZSetEntry({
      key,
      id: recordId,
      score: Date.now(),
    });
  }

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
      insertWorkspaceEvent: async <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) => {
        if (event === OBJECT_RECORD_VIEWED_EVENT) {
          await this.writeEventInRedis({
            ...(properties as TrackEventProperties<
              typeof OBJECT_RECORD_VIEWED_EVENT
            >),
            ...userIdAndWorkspaceId,
          });
        }

        return this.preventIfDisabled(() =>
          this.clickHouseService.insert('workspaceEvent', [
            { ...userIdAndWorkspaceId, ...makeTrackEvent(event, properties) },
          ]),
        );
      },
      createObjectEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T> & {
          recordId: string;
          objectMetadataId: string;
        },
      ) => {
        return this.preventIfDisabled(() =>
          this.clickHouseService.insert('objectEvent', [
            { ...userIdAndWorkspaceId, ...makeTrackEvent(event, properties) },
          ]),
        );
      },
      createPageviewEvent: (
        name: string,
        properties: Partial<PageviewProperties>,
      ) => {
        return this.preventIfDisabled(() =>
          this.clickHouseService.insert('pageview', [
            { ...userIdAndWorkspaceId, ...makePageview(name, properties) },
          ]),
        );
      },
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
