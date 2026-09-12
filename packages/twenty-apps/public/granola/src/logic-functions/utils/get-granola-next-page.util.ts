import { isNonEmptyString } from '@sniptt/guards';

import { GRANOLA_HISTORY_MAX_PAGES } from 'src/constants/granola-history.constant';

export type GranolaNextPage =
  | { kind: 'complete' }
  | { kind: 'stalled'; reason: string }
  | { kind: 'next'; cursor: string };

export const getGranolaNextPage = ({
  hasMore,
  cursor,
  previousCursor,
  pageIndex,
}: {
  hasMore: boolean;
  cursor: string | null;
  previousCursor?: string;
  pageIndex: number;
}): GranolaNextPage => {
  if (!hasMore) {
    return { kind: 'complete' };
  }

  if (
    !isNonEmptyString(cursor) ||
    cursor === previousCursor ||
    pageIndex + 1 >= GRANOLA_HISTORY_MAX_PAGES
  ) {
    return {
      kind: 'stalled',
      reason: 'Granola pagination stopped at a repeated cursor or page limit.',
    };
  }

  return { kind: 'next', cursor };
};
