import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { canGroupRecordsByFieldMetadataItem } from '@/object-record/record-group/utils/canGroupRecordsByFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

// Select fields only: the server generates their groups and widgets lack an add-group flow.
export const isFieldMetadataItemAvailableAsWidgetGroupByField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  fieldMetadataItem.type === FieldMetadataType.SELECT &&
  canGroupRecordsByFieldMetadataItem(fieldMetadataItem);
