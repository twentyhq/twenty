export const getForeignKeyNameFromRelationFieldName = (nameSingular: string) =>
  // Metadata and protocol identifiers must stay stable across locales.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  `${nameSingular}Id`;
