import { capitalize } from '~/utils/string/capitalize';

export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!objectMetadataNamePlural) {
    throw new Error('objectMetadataNamePlural is required');
  }
  return `AggregateMany${capitalize(objectMetadataNamePlural)}`;
};
