export const getSidePanelSearchRecordsToDisplay = <TSearchRecord>({
  searchRecords,
  isLoading,
  isSearchSkipped,
  hasSearchSettledSinceLastSkip,
}: {
  searchRecords: TSearchRecord[];
  isLoading: boolean;
  isSearchSkipped: boolean;
  hasSearchSettledSinceLastSkip: boolean;
}) => {
  const nextHasSearchSettledSinceLastSkip =
    !isSearchSkipped && (!isLoading || hasSearchSettledSinceLastSkip);

  return {
    hasSearchSettledSinceLastSkip: nextHasSearchSettledSinceLastSkip,
    searchRecordsToDisplay:
      isLoading && !nextHasSearchSettledSinceLastSkip ? [] : searchRecords,
  };
};
