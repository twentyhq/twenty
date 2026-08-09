export type CursorPaginationDirection = 'forward' | 'backward';

export type CursorPageFlags = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CursorPage<TItem> = {
  items: TItem[];
  pageInfo: CursorPageFlags;
};

// Query adapters fetch limit + 1 items in pagination order. This function owns
// the transport-neutral page window: trimming the sentinel item, restoring
// presentation order for backward pages, and deriving both navigation flags.
export const buildCursorPage = <TItem>({
  fetchedItems,
  limit,
  direction,
  hasAfterCursor = false,
  hasBeforeCursor = false,
}: {
  fetchedItems: TItem[];
  limit: number;
  direction: CursorPaginationDirection;
  hasAfterCursor?: boolean;
  hasBeforeCursor?: boolean;
}): CursorPage<TItem> => {
  const hasMoreItems = fetchedItems.length > limit;
  const items = fetchedItems.slice(0, limit);

  if (direction === 'backward') {
    items.reverse();
  }

  return {
    items,
    pageInfo: {
      hasNextPage: direction === 'backward' ? hasBeforeCursor : hasMoreItems,
      hasPreviousPage: direction === 'backward' ? hasMoreItems : hasAfterCursor,
    },
  };
};
