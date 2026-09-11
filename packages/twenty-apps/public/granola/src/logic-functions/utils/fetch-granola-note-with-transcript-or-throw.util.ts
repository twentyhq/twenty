import {
  GRANOLA_TRANSCRIPT_MAX_PAGES,
  GRANOLA_TRANSCRIPT_PAGE_SIZE,
  GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS,
} from 'src/constants/granola-transcript.constant';
import { GRANOLA_PAGE_INTERVAL_MILLISECONDS } from 'src/constants/granola-api.constant';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { type GranolaTranscriptItem } from 'src/logic-functions/types/granola-api.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isDefined } from 'twenty-sdk/utils';

export const fetchGranolaNoteWithTranscriptOrThrow = async ({
  client,
  noteId,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'getNote' | 'listTranscriptPage'
  >;
  noteId: string;
}) => {
  try {
    return await client.getNote({ noteId, includeTranscript: true });
  } catch (error) {
    if (!(error instanceof GranolaApiError) || error.status !== 413) {
      throw error;
    }
  }

  const note = await client.getNote({ noteId });
  const transcript: GranolaTranscriptItem[] = [];
  const seenCursors = new Set<string>();
  const startedAt = Date.now();
  let cursor: string | undefined;

  for (
    let pageIndex = 0;
    pageIndex < GRANOLA_TRANSCRIPT_MAX_PAGES;
    pageIndex++
  ) {
    if (Date.now() - startedAt >= GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS) {
      throw new GranolaTranscriptLimitError({ reason: 'time-limit' });
    }
    const page = await client.listTranscriptPage({
      noteId,
      cursor,
      page_size: GRANOLA_TRANSCRIPT_PAGE_SIZE,
    });

    transcript.push(...page.transcript);

    if (!page.hasMore) {
      return { ...note, transcript };
    }

    if (!isDefined(page.cursor) || seenCursors.has(page.cursor)) {
      throw new GranolaTranscriptLimitError({
        reason: 'non-advancing-cursor',
        noteId,
        cursor: page.cursor,
      });
    }

    seenCursors.add(page.cursor);
    cursor = page.cursor;
    await new Promise((resolve) =>
      setTimeout(resolve, GRANOLA_PAGE_INTERVAL_MILLISECONDS),
    );
  }

  throw new GranolaTranscriptLimitError({ reason: 'page-limit' });
};
