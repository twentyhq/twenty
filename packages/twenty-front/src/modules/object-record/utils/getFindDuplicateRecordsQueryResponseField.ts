export const getFindDuplicateRecordsQueryResponseField = (
  objectNameSingular: string,
  // Metadata and protocol identifiers must stay stable across locales.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
) => `${objectNameSingular}Duplicates`;
