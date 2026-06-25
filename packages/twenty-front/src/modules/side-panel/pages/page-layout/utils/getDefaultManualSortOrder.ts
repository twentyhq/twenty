type FieldOption = {
  value: string;
  position?: number | null;
};

export const getDefaultManualSortOrder = (
  options: FieldOption[] | null | undefined,
): string[] => {
  if (!options) return [];

  const sortedByPosition = options.toSorted(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );

  return sortedByPosition.map((option) => option.value);
};
