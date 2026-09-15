import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { canGroupRecordsByFieldMetadataItem } from '@/object-record/record-group/utils/canGroupRecordsByFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

// Widgets only offer select-field grouping: the server auto-generates
// view groups from select options, and widgets have no per-record
// add-group flow like the record index page.
export const isFieldMetadataItemAvailableAsWidgetGroupByField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  fieldMetadataItem.type === FieldMetadataType.SELECT &&
  canGroupRecordsByFieldMetadataItem(fieldMetadataItem);
