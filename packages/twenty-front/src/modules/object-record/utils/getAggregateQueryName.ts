import { capitalize, isDefined } from 'twenty-shared';

export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!isDefined(objectMetadataNamePlural)) {
    throw new Error('objectMetadataNamePlural is required');
  }
  return `Aggregate${capitalize(objectMetadataNamePlural)}`;
};
