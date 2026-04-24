import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import type { SegmentDto } from '@modules/resend/sync/types/segment.dto';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import { forEachPage } from '@modules/resend/shared/utils/for-each-page';
import { toIsoString } from '@modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';

export type SegmentIdMap = Map<string, string>;

type RawSegment = {
  id: string;
  name: string;
  created_at: string;
};

const toSegmentDto = (segment: RawSegment, syncedAt: string): SegmentDto => ({
  name: segment.name,
  createdAt: toIsoString(segment.created_at),
  lastSyncedFromResend: syncedAt,
});

export type SyncSegmentsOptions = {
  deadlineAtMs?: number;
};

export const syncSegments = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
  options?: SyncSegmentsOptions,
): Promise<SyncStepResult<SegmentIdMap>> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  const segmentIdMap: SegmentIdMap = new Map();

  await withSyncCursor(client, 'SEGMENTS', async ({ resumeCursor, onCursorAdvance }) => {
    const { completed } = await forEachPage(
      (paginationParameters) => resend.segments.list(paginationParameters),
      async (pageSegments) => {
        const pageOutcome = await upsertRecords({
          items: pageSegments,
          getId: (segment) => segment.id,
          mapCreateData: (_detail, item) => toSegmentDto(item, syncedAt),
          mapUpdateData: (_detail, item) => toSegmentDto(item, syncedAt),
          client,
          objectNameSingular: 'resendSegment',
          objectNamePlural: 'resendSegments',
        });

        aggregate.fetched += pageOutcome.result.fetched;
        aggregate.created += pageOutcome.result.created;
        aggregate.updated += pageOutcome.result.updated;
        aggregate.errors.push(...pageOutcome.result.errors);

        for (const [resendId, twentyId] of pageOutcome.twentyIdByResendId) {
          segmentIdMap.set(resendId, twentyId);
        }

        return { ok: pageOutcome.ok, errors: pageOutcome.result.errors };
      },
      'segments',
      {
        startCursor: resumeCursor,
        onCursorAdvance,
        ...(isDefined(options?.deadlineAtMs) && {
          deadlineAtMs: options.deadlineAtMs,
        }),
      },
    );

    return { value: undefined, completed };
  });

  return { result: aggregate, value: segmentIdMap };
};
