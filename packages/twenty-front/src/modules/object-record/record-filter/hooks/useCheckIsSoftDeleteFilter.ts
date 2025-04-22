import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useCheckIsSoftDeleteFilter = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const isSoftDeleteFilterActive = useRecoilComponentValueV2(
    isSoftDeleteFilterActiveComponentState,
  );

  const checkIsSoftDeleteFilter = (recordFilter: RecordFilter) => {
    const allFieldMetadataItems = objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.fields,
    );

    const foundFieldMetadataItem = allFieldMetadataItems.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === recordFilter.fieldMetadataId,
    );

    if (!isDefined(foundFieldMetadataItem)) {
      throw new Error(
        `Field metadata item not found for field metadata id: ${recordFilter.fieldMetadataId}`,
      );
    }

    return (
      foundFieldMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME &&
      isSoftDeleteFilterActive &&
      recordFilter.operand === RecordFilterOperand.IsNotEmpty
    );
  };

  return { checkIsSoftDeleteFilter };
};
