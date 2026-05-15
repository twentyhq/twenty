import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
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
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
  relationTargetFieldMetadataItem?: FieldMetadataItem | null | undefined;
  // Set when the next step is another dropdown that manages its own focus
  // (e.g. composite or relation-traversal sub-menus). The default push of
  // the source field id on the focus stack would shadow it.
  skipFocusPush?: boolean;
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

  const setRelationTargetFieldMetadataIdUsedInDropdown =
    useSetAtomComponentState(
      relationTargetFieldMetadataIdUsedInDropdownComponentState,
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
    relationTargetFieldMetadataItem,
    skipFocusPush,
  }: SelectFilterParams) => {
    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemId);

    const { fieldMetadataItem } =
      getFieldMetadataItemByIdOrThrow(fieldMetadataItemId);

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    if (
      skipFocusPush !== true &&
      (fieldMetadataItem.type === 'RELATION' ||
        fieldMetadataItem.type === 'SELECT')
    ) {
      pushFocusItemToFocusStack({
        focusId: fieldMetadataItem.id,
        component: {
          type: FocusComponentType.DROPDOWN,
          instanceId: fieldMetadataItem.id,
        },
      });
    }

    const isRelationTraversal = isDefined(relationTargetFieldMetadataItem);

    const filterType = getFilterTypeFromFieldType(
      isRelationTraversal
        ? relationTargetFieldMetadataItem.type
        : fieldMetadataItem.type,
    );

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

    const label = isRelationTraversal
      ? `${fieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`
      : fieldMetadataItem.label;

    const relationTargetField = isRelationTraversal
      ? {
          id: relationTargetFieldMetadataItem.id,
          name: relationTargetFieldMetadataItem.name,
          type: relationTargetFieldMetadataItem.type,
          label: relationTargetFieldMetadataItem.label,
        }
      : null;

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
      relationTargetField,
    } satisfies RecordFilter;

    setSubFieldNameUsedInDropdown(subFieldNameToUse);
    setRelationTargetFieldMetadataIdUsedInDropdown(
      relationTargetField?.id ?? null,
    );

    setObjectFilterDropdownSearchInput('');

    setObjectFilterDropdownCurrentRecordFilter(newAdvancedFilter);
    upsertRecordFilter(newAdvancedFilter);
  };

  return {
    selectFieldUsedInAdvancedFilterDropdown,
  };
};
