export const getUniqueSortedIds = (
  ids: Array<string | null | undefined>,
): string[] =>
  [...new Set(ids.filter((id): id is string => typeof id === 'string'))].sort(
    (firstId, secondId) => firstId.localeCompare(secondId),
  );
