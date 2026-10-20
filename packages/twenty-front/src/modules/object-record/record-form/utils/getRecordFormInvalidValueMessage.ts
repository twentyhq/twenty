import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getRecordFormInvalidValueMessage = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings'>,
): string | null => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.EMAILS:
      return t`Enter a valid email`;
    case FieldMetadataType.LINKS:
      return fieldMetadataItem.settings?.type === 'domain'
        ? t`Enter a valid domain`
        : t`Enter a valid URL`;
    case FieldMetadataType.PHONES:
      return t`Enter a valid phone number`;
    default:
      return null;
  }
};
