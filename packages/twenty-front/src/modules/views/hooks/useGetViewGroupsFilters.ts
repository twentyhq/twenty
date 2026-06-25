import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type ViewGroupsFilters = {
  recordFilters: RecordFilter[];
  recordGroupGqlFilter: RecordGqlOperationFilter | null;
};

export const useGetViewGroupsFilters = (): ViewGroupsFilters => {
  const { currentView } = useGetCurrentViewOnly();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const mainGroupByFieldMetadataId = currentView?.mainGroupByFieldMetadataId;

  if (!isDefined(mainGroupByFieldMetadataId)) {
    return { recordFilters: [], recordGroupGqlFilter: null };
  }

  const mainGroupByFieldMetadataItem = flattenedFieldMetadataItems.find(
    (fieldMetadataItem) => fieldMetadataItem.id === mainGroupByFieldMetadataId,
  );

  const viewGroups = currentView?.viewGroups ?? [];

  if (
    isDefined(mainGroupByFieldMetadataItem) &&
    isManyToOneRelationField(mainGroupByFieldMetadataItem)
  ) {
    const visibleGroups = viewGroups.filter((group) => group.isVisible);

    if (!isNonEmptyArray(visibleGroups)) {
      return {
        recordFilters: [],
        recordGroupGqlFilter: { id: { is: 'NULL' } },
      };
    }

    const visibleRecordGroupValues = visibleGroups.map((group) =>
      isNonEmptyString(group.fieldValue) ? group.fieldValue : null,
    );

    return {
      recordFilters: [],
      recordGroupGqlFilter: computeRecordGroupOptionsFilter({
        recordGroupFieldMetadata: mainGroupByFieldMetadataItem,
        recordGroupValues: visibleRecordGroupValues,
      }),
    };
  }

  const filterType = getFilterTypeFromFieldType(
    mainGroupByFieldMetadataItem?.type ?? FieldMetadataType.SELECT,
  );

  return {
    recordFilters: viewGroups
      .filter((recordGroup) => !recordGroup.isVisible)
      .map((recordGroup) => ({
        id: recordGroup.id,
        fieldMetadataId: mainGroupByFieldMetadataId,
        value: JSON.stringify([recordGroup.fieldValue]),
        operand: ViewFilterOperand.IS_NOT,
        displayValue: '',
        type: filterType,
        label: '',
      })),
    recordGroupGqlFilter: null,
  };
};
