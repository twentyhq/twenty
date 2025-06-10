import { capitalize, isDefined } from 'twenty-shared/utils';
export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!isDefined(objectMetadataNamePlural)) {
    throw new Error('objectMetadataNamePlural is required');
  }
  return `Aggregate${capitalize(objectMetadataNamePlural)}`;
};
