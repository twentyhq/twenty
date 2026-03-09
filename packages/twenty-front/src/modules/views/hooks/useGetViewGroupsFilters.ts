import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

export const useGetViewGroupsFilters = (): RecordFilter[] => {
  const { currentView } = useGetCurrentViewOnly();

  if (!isDefined(currentView?.mainGroupByFieldMetadataId)) {
    return [];
  }

  return (
    currentView.viewGroups
      .filter((recordGroup) => !recordGroup.isVisible)
      .map((recordGroup) => {
        return {
          id: recordGroup.id,
          fieldMetadataId: currentView.mainGroupByFieldMetadataId,
          value: JSON.stringify([recordGroup.fieldValue]),
          operand: ViewFilterOperand.IS_NOT,
          displayValue: '',
          type: getFilterTypeFromFieldType(FieldMetadataType.SELECT),
          label: '',
        };
      }) || []
  );
};
