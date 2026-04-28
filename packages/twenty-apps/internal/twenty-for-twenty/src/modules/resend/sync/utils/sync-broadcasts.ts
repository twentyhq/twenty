import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { findTwentyIdsByResendId } from '@modules/resend/shared/utils/find-twenty-ids-by-resend-id';
import { forEachPage } from '@modules/resend/shared/utils/for-each-page';
import { getErrorMessage } from '@modules/resend/shared/utils/get-error-message';
import { toEmailsField } from '@modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from '@modules/resend/shared/utils/to-iso-string';
import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';
import type { CreateBroadcastDto } from '@modules/resend/sync/types/create-broadcast.dto';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import type { UpdateBroadcastDto } from '@modules/resend/sync/types/update-broadcast.dto';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

type BroadcastDetail = Awaited<
  ReturnType<Resend['broadcasts']['get']>
>['data'];

const fetchBroadcastDetailsForPage = async (
  resend: Resend,
  pageBroadcasts: ReadonlyArray<{ id: string }>,
  errors: string[],
): Promise<Map<string, NonNullable<BroadcastDetail>>> => {
  const detailByResendId = new Map<string, NonNullable<BroadcastDetail>>();

  for (const broadcast of pageBroadcasts) {
    try {
      const { data: detail, error } = await withRateLimitRetry(
        () => resend.broadcasts.get(broadcast.id),
        { channel: 'broadcasts-detail' },
      );

      if (isDefined(error) || !isDefined(detail)) {
        errors.push(
          `resendBroadcast ${broadcast.id} detail: ${JSON.stringify(error)}`,
        );
        continue;
      }

      detailByResendId.set(broadcast.id, detail);
    } catch (error) {
      errors.push(
        `resendBroadcast ${broadcast.id} detail: ${getErrorMessage(error)}`,
      );
    }
  }

  return detailByResendId;
};

export type SyncBroadcastsOptions = {
  deadlineAtMs?: number;
};

export const syncBroadcasts = async (
  resend: Resend,
  client: CoreApiClient,
  options?: SyncBroadcastsOptions,
): Promise<SyncStepResult> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  await withSyncCursor(
    client,
    'BROADCASTS',
    async ({ resumeCursor, onCursorAdvance }) => {
      const { completed } = await forEachPage(
        (paginationParameters) => resend.broadcasts.list(paginationParameters),
        async (pageBroadcasts) => {
          const detailByResendId = await fetchBroadcastDetailsForPage(
            resend,
            pageBroadcasts,
            aggregate.errors,
          );

          const segmentResendIds = pageBroadcasts
            .map((broadcast) => broadcast.segment_id)
            .filter(
              (segmentId): segmentId is string =>
                typeof segmentId === 'string' && segmentId.length > 0,
            );

          const topicResendIds = Array.from(detailByResendId.values())
            .map((detail) => detail.topic_id)
            .filter(
              (topicId): topicId is string =>
                typeof topicId === 'string' && topicId.length > 0,
            );

          const [segmentMap, topicMap] = await Promise.all([
            segmentResendIds.length > 0
              ? findTwentyIdsByResendId(
                  client,
                  'resendSegments',
                  segmentResendIds,
                )
              : Promise.resolve(new Map<string, string>()),
            topicResendIds.length > 0
              ? findTwentyIdsByResendId(
                  client,
                  'resendTopics',
                  topicResendIds,
                )
              : Promise.resolve(new Map<string, string>()),
          ]);

          const pageOutcome = await upsertRecords({
            items: pageBroadcasts,
            getId: (broadcast) => broadcast.id,
            mapCreateData: (_detail, broadcast): CreateBroadcastDto => {
              const data: CreateBroadcastDto = {
                name: broadcast.name,
                status: broadcast.status.toUpperCase(),
                createdAt: toIsoString(broadcast.created_at),
                scheduledAt: toIsoStringOrNull(broadcast.scheduled_at),
                sentAt: toIsoStringOrNull(broadcast.sent_at),
              };

              if (isDefined(broadcast.segment_id)) {
                const segmentId = segmentMap.get(broadcast.segment_id);

                if (isDefined(segmentId)) {
                  data.segmentId = segmentId;
                }
              }

              const detail = detailByResendId.get(broadcast.id);

              if (isDefined(detail)) {
                data.subject = detail.subject ?? '';
                data.fromAddress = toEmailsField(detail.from);
                data.replyTo = toEmailsField(detail.reply_to);
                data.previewText = detail.preview_text ?? '';
                data.htmlBody = detail.html ?? '';
                data.textBody = detail.text ?? '';

                if (isDefined(detail.topic_id)) {
                  const topicId = topicMap.get(detail.topic_id);

                  if (isDefined(topicId)) {
                    data.topicId = topicId;
                  }
                }
              }

              return data;
            },
            mapUpdateData: (_detail, broadcast): UpdateBroadcastDto => {
              const data: UpdateBroadcastDto = {
                status: broadcast.status.toUpperCase(),
                scheduledAt: toIsoStringOrNull(broadcast.scheduled_at),
                sentAt: toIsoStringOrNull(broadcast.sent_at),
              };

              if (!isDefined(broadcast.segment_id)) {
                data.segmentId = null;
              } else {
                const segmentId = segmentMap.get(broadcast.segment_id);

                if (isDefined(segmentId)) {
                  data.segmentId = segmentId;
                } else {
                  console.warn(
                    `[sync] broadcast ${broadcast.id}: segment ${broadcast.segment_id} not found in lookup map; leaving segmentId untouched`,
                  );
                }
              }

              const detail = detailByResendId.get(broadcast.id);

              if (isDefined(detail)) {
                data.subject = detail.subject ?? '';
                data.fromAddress = toEmailsField(detail.from);
                data.replyTo = toEmailsField(detail.reply_to);
                data.previewText = detail.preview_text ?? '';
                data.htmlBody = detail.html ?? '';
                data.textBody = detail.text ?? '';

                if (!isDefined(detail.topic_id)) {
                  data.topicId = null;
                } else {
                  const topicId = topicMap.get(detail.topic_id);

                  if (isDefined(topicId)) {
                    data.topicId = topicId;
                  } else {
                    console.warn(
                      `[sync] broadcast ${broadcast.id}: topic ${detail.topic_id} not found in lookup map; leaving topicId untouched`,
                    );
                  }
                }
              }

              return data;
            },
            client,
            objectNameSingular: 'resendBroadcast',
            objectNamePlural: 'resendBroadcasts',
          });

          aggregate.fetched += pageOutcome.result.fetched;
          aggregate.created += pageOutcome.result.created;
          aggregate.updated += pageOutcome.result.updated;
          aggregate.errors.push(...pageOutcome.result.errors);

          return { ok: pageOutcome.ok, errors: pageOutcome.result.errors };
        },
        'broadcasts',
        {
          startCursor: resumeCursor,
          onCursorAdvance,
          ...(isDefined(options?.deadlineAtMs) && {
            deadlineAtMs: options.deadlineAtMs,
          }),
        },
      );

      return { value: undefined, completed };
    },
  );

  return { result: aggregate, value: undefined };
};
