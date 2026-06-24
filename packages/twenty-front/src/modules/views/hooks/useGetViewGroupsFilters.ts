import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

export const useGetViewGroupsFilters = (): RecordFilter[] => {
  const { currentView } = useGetCurrentViewOnly();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const mainGroupByFieldMetadataId = currentView?.mainGroupByFieldMetadataId;

  if (!isDefined(mainGroupByFieldMetadataId)) {
    return [];
  }

  const mainGroupByFieldMetadataItem = flattenedFieldMetadataItems.find(
    (fieldMetadataItem) => fieldMetadataItem.id === mainGroupByFieldMetadataId,
  );

  const isRelationGroupBy =
    isDefined(mainGroupByFieldMetadataItem) &&
    isManyToOneRelationField(mainGroupByFieldMetadataItem);

  const filterType = getFilterTypeFromFieldType(
    mainGroupByFieldMetadataItem?.type ?? FieldMetadataType.SELECT,
  );

  return (currentView?.viewGroups ?? [])
    .filter((recordGroup) => !recordGroup.isVisible)
    .map((recordGroup) => {
      const isNoValueGroup =
        !isDefined(recordGroup.fieldValue) || recordGroup.fieldValue === '';

      if (isRelationGroupBy && isNoValueGroup) {
        return {
          id: recordGroup.id,
          fieldMetadataId: mainGroupByFieldMetadataId,
          value: '',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          displayValue: '',
          type: filterType,
          label: '',
        };
      }

      return {
        id: recordGroup.id,
        fieldMetadataId: mainGroupByFieldMetadataId,
        value: JSON.stringify([recordGroup.fieldValue]),
        operand: ViewFilterOperand.IS_NOT,
        displayValue: '',
        type: filterType,
        label: '',
      };
    });
};
