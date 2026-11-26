export const getSidePanelSearchRecordsToDisplay = <TSearchRecord>({
  searchRecords,
  isLoading,
  isSearchSkipped,
  canDisplayPreviousSearchRecords,
}: {
  searchRecords: TSearchRecord[];
  isLoading: boolean;
  isSearchSkipped: boolean;
  canDisplayPreviousSearchRecords: boolean;
}) => {
  const nextCanDisplayPreviousSearchRecords =
    !isSearchSkipped && (!isLoading || canDisplayPreviousSearchRecords);

  return {
    canDisplayPreviousSearchRecords: nextCanDisplayPreviousSearchRecords,
    searchRecordsToDisplay:
      isLoading && !nextCanDisplayPreviousSearchRecords ? [] : searchRecords,
  };
};
