import { type DataPage } from '@/data/types/data-page.type';
import { CliError } from '@/output/cli-error';

export async function* iterateDataPages({
  fetchPage,
  cursor,
  signal,
}: {
  fetchPage: (cursor?: string) => Promise<DataPage>;
  cursor?: string;
  signal: AbortSignal;
}) {
  let pageCursor = cursor;
  let checkpoint = cursor;
  let checkpointInterval = 1;
  let pagesSinceCheckpoint = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    signal.throwIfAborted();
    const page = await fetchPage(pageCursor);
    signal.throwIfAborted();
    const nextCursor = page.pageInfo.endCursor ?? undefined;

    if (
      page.records.length > 0 &&
      (nextCursor === pageCursor || nextCursor === checkpoint)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server returned a repeated pagination cursor.',
      });
    }

    hasNextPage = page.pageInfo.hasNextPage;

    if (hasNextPage) {
      pagesSinceCheckpoint += 1;

      if (pagesSinceCheckpoint === checkpointInterval) {
        checkpoint = nextCursor;
        checkpointInterval *= 2;
        pagesSinceCheckpoint = 0;
      }
    }

    yield page;
    pageCursor = nextCursor;
  }
}
