import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldColumnLabel = ({
  recordField,
  fieldMetadataItem,
  lookupTargetFieldMetadataItem,
}: {
  recordField: Pick<RecordField, 'settings'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'label'> | undefined;
  lookupTargetFieldMetadataItem?: Pick<FieldMetadataItem, 'label'>;
}) =>
  recordField.settings?.label ??
  (isDefined(lookupTargetFieldMetadataItem)
    ? `${fieldMetadataItem?.label ?? ''} › ${lookupTargetFieldMetadataItem.label}`
    : (fieldMetadataItem?.label ?? ''));
