import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { isDefined } from 'twenty-shared/utils';

export const isScopedRelationColumn = ({
  fieldMetadataItem,
  recordField,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  fieldMetadataItem: FieldMetadataItem;
  recordField: Pick<RecordField, 'isCanonical' | 'relationScope'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}): boolean =>
  isLookupColumnsEnabled &&
  !isCanonicalRecordField(recordField) &&
  isDefined(recordField.relationScope) &&
  isScopableRelationField({ fieldMetadataItem, objectMetadataItems });
