import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordGroupByFieldColumnName } from '@/object-record/record-group/utils/getRecordGroupByFieldColumnName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
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
    const columnName = getRecordGroupByFieldColumnName(
      mainGroupByFieldMetadataItem,
    );

    const visibleGroups = viewGroups.filter((group) => group.isVisible);

    const clauses: RecordGqlOperationFilter[] = [];

    const visibleRecordIds = visibleGroups
      .map((group) => group.fieldValue)
      .filter(
        (fieldValue): fieldValue is string =>
          isDefined(fieldValue) && fieldValue !== '',
      );

    if (visibleRecordIds.length > 0) {
      clauses.push({ [columnName]: { in: visibleRecordIds } });
    }

    const isNoValueGroupVisible = visibleGroups.some(
      (group) => !isDefined(group.fieldValue) || group.fieldValue === '',
    );

    if (isNoValueGroupVisible) {
      clauses.push({ [columnName]: { is: 'NULL' } });
    }

    return {
      recordFilters: [],
      recordGroupGqlFilter:
        clauses.length === 0
          ? { id: { is: 'NULL' } }
          : clauses.length === 1
            ? clauses[0]
            : { or: clauses },
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
