import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type ApplyAdvancedFilterSourceFieldParams = {
  sourceFieldMetadataItem: FieldMetadataItem;
  recordFilterId: string;
};

// Creates an advanced filter from a source-field-only selection: the
// terminal case for leaf source fields, and the initial state when the
// user picks a composite or relation source before drilling into the
// sub-menu (so the dropdown has a record filter to render against).
export const useApplyAdvancedFilterSourceField = () => {
  const setSelectedOperandInDropdown = useSetAtomComponentState(
    selectedOperandInDropdownComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

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

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { getInitialFilterValue } = useGetInitialFilterValue();

  const applyAdvancedFilterSourceField = ({
    sourceFieldMetadataItem,
    recordFilterId,
  }: ApplyAdvancedFilterSourceFieldParams) => {
    setFieldMetadataItemIdUsedInDropdown(sourceFieldMetadataItem.id);

    const filterType = getFilterTypeFromFieldType(sourceFieldMetadataItem.type);

    // Composite types that aren't filterable across "any subfield" need a
    // concrete subfield to produce a valid filter — pick a default so the
    // initial state is usable before the user drills into the sub-menu.
    let defaultSubFieldName: CompositeFieldSubFieldName | null = null;
    if (
      isCompositeFieldType(filterType) &&
      isCompositeTypeNonFilterableByAnySubField(filterType)
    ) {
      defaultSubFieldName =
        getDefaultSubFieldNameForCompositeFilterableFieldType(filterType);
    }

    const firstOperand = getRecordFilterOperands({
      filterType,
      subFieldName: defaultSubFieldName,
    })?.[0];

    if (!isDefined(firstOperand)) {
      throw new Error(
        `No valid operand found for filter type: ${filterType} and subFieldName: ${defaultSubFieldName}`,
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

    const newAdvancedFilter = {
      id: recordFilterId,
      fieldMetadataId: sourceFieldMetadataItem.id,
      displayValue,
      operand: firstOperand,
      value,
      recordFilterGroupId: existingRecordFilter?.recordFilterGroupId,
      positionInRecordFilterGroup:
        existingRecordFilter?.positionInRecordFilterGroup,
      type: filterType,
      label: sourceFieldMetadataItem.label,
      subFieldName: defaultSubFieldName,
      relationTargetFieldMetadataId: null,
    } satisfies RecordFilter;

    setSubFieldNameUsedInDropdown(defaultSubFieldName);
    setRelationTargetFieldMetadataIdUsedInDropdown(null);

    setObjectFilterDropdownSearchInput('');

    setObjectFilterDropdownCurrentRecordFilter(newAdvancedFilter);
    upsertRecordFilter(newAdvancedFilter);
  };

  return {
    applyAdvancedFilterSourceField,
  };
};
