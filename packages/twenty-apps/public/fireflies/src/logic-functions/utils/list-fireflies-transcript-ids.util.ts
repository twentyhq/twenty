import { FIREFLIES_BACKFILL_MAX_PAGE_COUNT } from 'src/logic-functions/constants/fireflies-backfill-max-page-count.constant';
import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size.constant';
import { type ListFirefliesTranscriptIdsResult } from 'src/logic-functions/types/list-fireflies-transcript-ids-result.type';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts.util';

export const listFirefliesTranscriptIds = async ({
  apiKey,
  fromDate,
  toDate,
}: {
  apiKey: string;
  fromDate: string;
  toDate: string;
}): Promise<ListFirefliesTranscriptIdsResult> => {
  const transcriptIds: string[] = [];
  let skip = 0;

  for (
    let pageIndex = 0;
    pageIndex < FIREFLIES_BACKFILL_MAX_PAGE_COUNT;
    pageIndex++
  ) {
    const listFirefliesTranscriptsResult = await listFirefliesTranscripts({
      apiKey,
      fromDate,
      toDate,
      limit: FIREFLIES_BACKFILL_PAGE_SIZE,
      skip,
    });

    if (!listFirefliesTranscriptsResult.ok) {
      return {
        ok: false,
        status: listFirefliesTranscriptsResult.status,
        errorMessage: listFirefliesTranscriptsResult.errorMessage,
      };
    }

    transcriptIds.push(
      ...listFirefliesTranscriptsResult.data.map(
        (firefliesCallSummary) => firefliesCallSummary.id,
      ),
    );

    if (
      listFirefliesTranscriptsResult.data.length < FIREFLIES_BACKFILL_PAGE_SIZE
    ) {
      return { ok: true, transcriptIds };
    }

    skip += listFirefliesTranscriptsResult.data.length;
  }

  return {
    ok: false,
    status: 0,
    errorMessage: `Fireflies backfill listing exceeded ${FIREFLIES_BACKFILL_MAX_PAGE_COUNT} pages`,
  };
};
