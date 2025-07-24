import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { v4 } from 'uuid';

export const createAnyFieldRecordFilterBaseProperties = ({
  filterValue,
  fieldMetadataItem,
}: {
  filterValue: string;
  fieldMetadataItem: FieldMetadataItem;
}): Pick<
  RecordFilter,
  'id' | 'value' | 'displayValue' | 'label' | 'fieldMetadataId'
> => {
  return {
    id: v4(),
    value: filterValue,
    displayValue: '',
    label: '',
    fieldMetadataId: fieldMetadataItem.id,
  };
};
