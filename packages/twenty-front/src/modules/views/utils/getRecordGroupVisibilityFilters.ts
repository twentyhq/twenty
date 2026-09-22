import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { type View } from '@/views/types/View';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

export type RecordGroupVisibilityFilters = {
  recordFilters: RecordFilter[];
  recordGroupGqlFilter: RecordGqlOperationFilter | null;
};

export const getRecordGroupVisibilityFilters = ({
  view,
  fieldMetadataItems,
}: {
  view: View | null | undefined;
  fieldMetadataItems: FieldMetadataItem[];
}): RecordGroupVisibilityFilters => {
  const mainGroupByFieldMetadataId = view?.mainGroupByFieldMetadataId;

  if (!isDefined(mainGroupByFieldMetadataId)) {
    return { recordFilters: [], recordGroupGqlFilter: null };
  }

  const mainGroupByFieldMetadataItem = fieldMetadataItems.find(
    (fieldMetadataItem) => fieldMetadataItem.id === mainGroupByFieldMetadataId,
  );

  const viewGroups = view?.viewGroups ?? [];

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
