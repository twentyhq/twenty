import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { isDefined } from 'twenty-shared/utils';

export const isScopedRelationColumn = ({
  fieldMetadataItem,
  recordField,
  isLookupColumnsEnabled,
}: {
  fieldMetadataItem: FieldMetadataItem;
  recordField: Pick<RecordField, 'isCanonical' | 'relationScope'>;
  isLookupColumnsEnabled: boolean;
}): boolean =>
  // With the flag off a scoped column renders and loads as its plain relation
  isLookupColumnsEnabled &&
  !isCanonicalRecordField(recordField) &&
  isDefined(recordField.relationScope) &&
  isPlainOneToManyRelationField(fieldMetadataItem);
