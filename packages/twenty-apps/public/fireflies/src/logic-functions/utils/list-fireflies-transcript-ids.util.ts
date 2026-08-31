import { FIREFLIES_BACKFILL_MAX_PAGE_COUNT } from 'src/logic-functions/constants/fireflies-backfill-max-page-count.constant';
import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size.constant';
import { type ListFirefliesTranscriptIdsResult } from 'src/logic-functions/types/list-fireflies-transcript-ids-result.type';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts.util';

export const listFirefliesTranscriptIds = ({
  accessToken,
  fromDate,
  toDate,
}: {
  accessToken: string;
  fromDate: string;
  toDate: string;
}): Promise<ListFirefliesTranscriptIdsResult> =>
  collectFirefliesTranscriptIdPages({
    accessToken,
    fromDate,
    toDate,
    skip: 0,
    pageIndex: 0,
    transcriptIds: [],
  });

const collectFirefliesTranscriptIdPages = async ({
  accessToken,
  fromDate,
  toDate,
  skip,
  pageIndex,
  transcriptIds,
}: {
  accessToken: string;
  fromDate: string;
  toDate: string;
  skip: number;
  pageIndex: number;
  transcriptIds: string[];
}): Promise<ListFirefliesTranscriptIdsResult> => {
  if (pageIndex >= FIREFLIES_BACKFILL_MAX_PAGE_COUNT) {
    return {
      ok: false,
      status: 0,
      errorMessage: `Fireflies backfill listing exceeded ${FIREFLIES_BACKFILL_MAX_PAGE_COUNT} pages`,
    };
  }

  const listFirefliesTranscriptsResult = await listFirefliesTranscripts({
    accessToken,
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

  const collectedTranscriptIds = [
    ...transcriptIds,
    ...listFirefliesTranscriptsResult.data.map(
      (firefliesCallSummary) => firefliesCallSummary.id,
    ),
  ];

  if (
    listFirefliesTranscriptsResult.data.length < FIREFLIES_BACKFILL_PAGE_SIZE
  ) {
    return { ok: true, transcriptIds: collectedTranscriptIds };
  }

  return collectFirefliesTranscriptIdPages({
    accessToken,
    fromDate,
    toDate,
    skip: skip + listFirefliesTranscriptsResult.data.length,
    pageIndex: pageIndex + 1,
    transcriptIds: collectedTranscriptIds,
  });
};
