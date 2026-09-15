import { isNonEmptyString } from '@sniptt/guards';
import { INDEXABLE_OPTION_SEPARATOR } from '@/settings/data-model/indexes/utils/indexableOptionSeparator';

export const decodeIndexableOptionValue = (
  value: string,
): { fieldMetadataId: string; subFieldName: string | null } => {
  const [fieldMetadataId, subFieldName] = value.split(
    INDEXABLE_OPTION_SEPARATOR,
  );

  return {
    fieldMetadataId,
    subFieldName: isNonEmptyString(subFieldName) ? subFieldName : null,
  };
};
