export const getPreselectedIdIndex = (
  selectableOptionIds: string[],
  preselectedOptionId: string,
) => {
  const preselectedIdIndex = selectableOptionIds.findIndex(
    (option) => option === preselectedOptionId,
  );

  return preselectedIdIndex === -1 ? 0 : preselectedIdIndex;
};
