import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type SelectFilterParams = {
  fieldMetadataItemId: string;
  recordFilterId: string;
  // For composite fields this is the sub-field key (e.g. 'firstName').
  // For relation traversal this is the target field's name on the related
  // object (e.g. 'name' for `company.name`).
  subFieldName?: string | null | undefined;
  // Present when the user drilled into a relation and picked a field on
  // the target object. The filter then operates on the target field's
  // type/operand set rather than on the relation itself.
  targetFieldMetadataItem?: FieldMetadataItem | null | undefined;
};

export const useSelectFieldUsedInAdvancedFilterDropdown = () => {
  const setSelectedOperandInDropdown = useSetAtomComponentState(
    selectedOperandInDropdownComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const setSubFieldNameUsedInDropdown = useSetAtomComponentState(
    subFieldNameUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownCurrentRecordFilter = useSetAtomComponentState(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { getInitialFilterValue } = useGetInitialFilterValue();

  const selectFieldUsedInAdvancedFilterDropdown = ({
    fieldMetadataItemId,
    recordFilterId,
    subFieldName,
    targetFieldMetadataItem,
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

    // Relation traversal: when the user picked a field on the target object,
    // drive the filter off the target field's type so the operand picker and
    // value editor behave as if they were filtering that field directly.
    const isRelationTraversal = isDefined(targetFieldMetadataItem);

    const effectiveFieldType = isRelationTraversal
      ? targetFieldMetadataItem.type
      : fieldMetadataItem.type;

    const filterType = getFilterTypeFromFieldType(effectiveFieldType);

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
      !isRelationTraversal &&
      isCompositeFieldType(filterType) &&
      !isDefined(subFieldName);
    const compositeFilterNonFilterableByAnySubField =
      isCompositeTypeNonFilterableByAnySubField(filterType);

    let subFieldNameForNonFilterableWithAny:
      | CompositeFieldSubFieldName
      | undefined
      | null = subFieldName as CompositeFieldSubFieldName | null | undefined;

    if (
      isCompositeFilterOnAnySubField &&
      compositeFilterNonFilterableByAnySubField
    ) {
      subFieldNameForNonFilterableWithAny =
        getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);
    }

    // For relation traversal, subFieldName is the target field's name (a free
    // string). RecordFilter stores it under the composite sub-field type for
    // compatibility — the serializer disambiguates via filter.type.
    const subFieldNameToUse = (subFieldName ??
      subFieldNameForNonFilterableWithAny) as
      | CompositeFieldSubFieldName
      | null
      | undefined;

    const label = isRelationTraversal
      ? `${fieldMetadataItem.label} → ${targetFieldMetadataItem.label}`
      : fieldMetadataItem.label;

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
      label,
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
