import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getDefaultSubFieldNameForCompositeFilterableFieldType } from '@/object-record/record-filter/utils/getDefaultSubFieldNameForCompositeFilterableFieldType';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { isCompositeTypeNonFilterableByAnySubField } from '@/object-record/record-filter/utils/isCompositeTypeNonFilterableByAnySubField';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type SelectFilterParams = {
  fieldMetadataItemId: string;
  recordFilterId: string;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
};

export const useSelectFieldUsedInAdvancedFilterDropdown = () => {
  const setSelectedOperandInDropdown = useSetRecoilComponentState(
    selectedOperandInDropdownComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownSearchInput = useSetRecoilComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const setSubFieldNameUsedInDropdown = useSetRecoilComponentState(
    subFieldNameUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownCurrentRecordFilter = useSetRecoilComponentState(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { getInitialFilterValue } = useGetInitialFilterValue();

  const selectFieldUsedInAdvancedFilterDropdown = ({
    fieldMetadataItemId,
    recordFilterId,
    subFieldName,
  }: SelectFilterParams) => {
    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemId);

    const { fieldMetadataItem } =
      getFieldMetadataItemByIdOrThrow(fieldMetadataItemId);

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    if (
      fieldMetadataItem.type === 'RELATION' ||
      fieldMetadataItem.type === 'SELECT'
    ) {
      pushFocusItemToFocusStack({
        focusId: fieldMetadataItem.id,
        component: {
          type: FocusComponentType.DROPDOWN,
          instanceId: fieldMetadataItem.id,
        },
      });
    }

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    const firstOperand = getRecordFilterOperands({
      filterType,
      subFieldName,
    })?.[0];

    if (!isDefined(firstOperand)) {
      throw new Error(
        `No valid operand found for filter type: ${filterType} and subFieldName: ${subFieldName}`,
      );
    }

    setSelectedOperandInDropdown(firstOperand);

    const { value, displayValue } = getInitialFilterValue(
      filterType,
      firstOperand,
    );

    const existingRecordFilter = currentRecordFilters.find(
      (recordFilter) => recordFilter.id === recordFilterId,
    );

    const isCompositeFilterOnAnySubField =
      isCompositeFieldType(filterType) && !isDefined(subFieldName);
    const compositeFilterNonFilterableByAnySubField =
      isCompositeTypeNonFilterableByAnySubField(filterType);

    let subFieldNameForNonFilterableWithAny:
      | CompositeFieldSubFieldName
      | undefined
      | null = subFieldName;

    if (
      isCompositeFilterOnAnySubField &&
      compositeFilterNonFilterableByAnySubField
    ) {
      subFieldNameForNonFilterableWithAny =
        getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);
    }

    const subFieldNameToUse =
      subFieldName ?? subFieldNameForNonFilterableWithAny;

    const newAdvancedFilter = {
      id: recordFilterId,
      fieldMetadataId: fieldMetadataItem.id,
      displayValue,
      operand: firstOperand,
      value,
      recordFilterGroupId: existingRecordFilter?.recordFilterGroupId,
      positionInRecordFilterGroup:
        existingRecordFilter?.positionInRecordFilterGroup,
      type: filterType,
      label: fieldMetadataItem.label,
      subFieldName: subFieldNameToUse,
    } satisfies RecordFilter;

    setSubFieldNameUsedInDropdown(subFieldNameToUse);

    setObjectFilterDropdownSearchInput('');

    setObjectFilterDropdownCurrentRecordFilter(newAdvancedFilter);
    upsertRecordFilter(newAdvancedFilter);
  };

  return {
    selectFieldUsedInAdvancedFilterDropdown,
  };
};
