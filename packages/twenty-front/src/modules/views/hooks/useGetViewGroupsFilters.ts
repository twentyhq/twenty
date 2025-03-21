import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType, isDefined } from 'twenty-shared';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const useGetViewGroupsFilters = (): RecordFilter[] => {
  const { currentView } = useGetCurrentViewOnly();

  return (
    currentView?.viewGroups
      .filter((recordGroup) => !recordGroup.isVisible)
      .map((recordGroup) => {
        return {
          id: recordGroup.id,
          fieldMetadataId: recordGroup.fieldMetadataId,
          value: JSON.stringify([recordGroup.fieldValue]),
          operand: ViewFilterOperand.IsNot,
          displayValue: '',
          type: getFilterTypeFromFieldType(FieldMetadataType.SELECT),
          label: '',
        };
      })
      .filter(isDefined) || []
  );
};
