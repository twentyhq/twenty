import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { AUDIT_FIELD_NAMES } from '~/pages/settings/data-model/constants/AuditFieldNames';
import { NON_COPYABLE_FIELD_TYPES } from '~/pages/settings/data-model/constants/NonCopyableFieldTypes';

export const isFieldMetadataItemCopyable = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type' | 'isSystem'>,
) =>
  fieldMetadataItem.isSystem !== true &&
  !AUDIT_FIELD_NAMES.includes(fieldMetadataItem.name) &&
  isFieldTypeSupportedInSettings(fieldMetadataItem.type) &&
  !NON_COPYABLE_FIELD_TYPES.includes(fieldMetadataItem.type);
