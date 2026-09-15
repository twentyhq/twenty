import { isNonEmptyString } from '@sniptt/guards';
import { INDEXABLE_OPTION_SEPARATOR } from '@/settings/data-model/indexes/utils/indexableOptionSeparator';

export const encodeIndexableOptionValue = (
  fieldMetadataId: string,
  subFieldName: string | null,
): string =>
  isNonEmptyString(subFieldName)
    ? `${fieldMetadataId}${INDEXABLE_OPTION_SEPARATOR}${subFieldName}`
    : fieldMetadataId;
