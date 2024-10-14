export const isOneRecordOrMoreSelected = (
  selectedRecordIds: 'all' | string[],
): boolean => {
  return selectedRecordIds === 'all' || selectedRecordIds.length >= 1;
};
