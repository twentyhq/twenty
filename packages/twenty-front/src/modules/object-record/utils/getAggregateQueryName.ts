import { capitalize, isDefined } from 'twenty-shared/utils';
export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!isDefined(objectMetadataNamePlural)) {
    // Error text is used for locale-independent issue grouping.
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    throw new Error('objectMetadataNamePlural is required');
  }
  // Metadata and protocol identifiers must stay stable across locales.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  return `Aggregate${capitalize(objectMetadataNamePlural)}`;
};
