export const orderRecordIdsBySelection = ({
  previousRecordIdsInSelectionOrder,
  selectedRecordIds,
}: {
  previousRecordIdsInSelectionOrder: string[];
  selectedRecordIds: string[];
}): string[] => {
  const selectedRecordIdSet = new Set(selectedRecordIds);
  const stillSelectedRecordIds = previousRecordIdsInSelectionOrder.filter(
    (recordId) => selectedRecordIdSet.has(recordId),
  );

  const stillSelectedRecordIdSet = new Set(stillSelectedRecordIds);
  const newlySelectedRecordIds = selectedRecordIds.filter(
    (recordId) => !stillSelectedRecordIdSet.has(recordId),
  );

  return [...stillSelectedRecordIds, ...newlySelectedRecordIds];
};
