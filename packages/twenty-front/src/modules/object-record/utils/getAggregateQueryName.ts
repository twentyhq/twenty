import { capitalize, isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
export const getAggregateQueryName = (
  objectMetadataNamePlural: string,
): string => {
  if (!isDefined(objectMetadataNamePlural)) {
    throw new Error(doNotTranslate('objectMetadataNamePlural is required'));
  }
  return doNotTranslate(`Aggregate${capitalize(objectMetadataNamePlural)}`);
};
