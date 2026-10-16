import { capitalize, doNotTranslate, isDefined } from 'twenty-shared/utils';
export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!isDefined(objectMetadataNamePlural)) {
    throw new Error(doNotTranslate('objectMetadataNamePlural is required'));
  }
  return doNotTranslate(`Aggregate${capitalize(objectMetadataNamePlural)}`);
};
