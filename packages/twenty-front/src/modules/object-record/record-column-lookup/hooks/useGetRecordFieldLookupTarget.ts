import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isLookupColumnsEnabledSelector } from '@/object-record/record-column-lookup/states/isLookupColumnsEnabledSelector';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// For lists of columns; a single column reads recordFieldLookupTargetFamilySelector
export const useGetRecordFieldLookupTarget = () => {
  const isLookupColumnsEnabled = useAtomStateValue(
    isLookupColumnsEnabledSelector,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  return ({
    recordField,
    fieldMetadataItem,
  }: {
    recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
    fieldMetadataItem: FieldMetadataItem;
  }) =>
    getRecordFieldLookupTarget({
      recordField,
      fieldMetadataItem,
      objectMetadataItems,
      isLookupColumnsEnabled,
    });
};
