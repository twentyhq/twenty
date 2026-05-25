import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import type { TopicDto } from '@modules/resend/sync/types/topic.dto';
import { toIsoString } from '@modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

export type TopicIdMap = Map<string, string>;

type RawTopic = {
  id: string;
  name: string;
  description?: string | null;
  default_subscription: string;
  visibility?: string;
  created_at: string;
};

const toTopicDto = (topic: RawTopic, syncedAt: string): TopicDto => ({
  name: topic.name,
  description: topic.description ?? '',
  defaultSubscription: topic.default_subscription.toUpperCase(),
  visibility: (topic.visibility ?? 'public').toUpperCase(),
  createdAt: toIsoString(topic.created_at),
  lastSyncedFromResend: syncedAt,
});

export type SyncTopicsOptions = {
  deadlineAtMs?: number;
};

export const syncTopics = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
  _options?: SyncTopicsOptions,
): Promise<SyncStepResult<TopicIdMap>> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  const topicIdMap: TopicIdMap = new Map();

  await withSyncCursor(client, 'TOPICS', async () => {
    const response = await withRateLimitRetry(() => resend.topics.list(), {
      channel: 'topics',
    });

    if (isDefined(response.error)) {
      throw new Error(
        `Resend list[topics] failed: ${JSON.stringify(response.error)}`,
      );
    }

    const topics = (response.data?.data ?? []) as RawTopic[];

    if (topics.length === 0) {
      return { value: undefined, completed: true };
    }

    console.log(`[resend] fetched topics page 1 (size=${topics.length})`);

    const pageOutcome = await upsertRecords({
      items: topics,
      getId: (topic) => topic.id,
      mapCreateData: (_detail, item) => toTopicDto(item, syncedAt),
      mapUpdateData: (_detail, item) => toTopicDto(item, syncedAt),
      client,
      objectNameSingular: 'resendTopic',
      objectNamePlural: 'resendTopics',
    });

    aggregate.fetched += pageOutcome.result.fetched;
    aggregate.created += pageOutcome.result.created;
    aggregate.updated += pageOutcome.result.updated;
    aggregate.errors.push(...pageOutcome.result.errors);

    for (const [resendId, twentyId] of pageOutcome.twentyIdByResendId) {
      topicIdMap.set(resendId, twentyId);
    }

    if (!pageOutcome.ok) {
      const detail =
        pageOutcome.result.errors.length > 0
          ? ` failures: ${pageOutcome.result.errors.join(' | ')}`
          : '';

      throw new Error(
        `Resend topics page reported per-item failures; aborting.${detail}`,
      );
    }

    return { value: undefined, completed: true };
  });

  return { result: aggregate, value: topicIdMap };
};
