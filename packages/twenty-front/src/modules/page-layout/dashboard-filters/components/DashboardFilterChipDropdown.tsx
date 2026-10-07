import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { useStore } from 'jotai';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  getFilterTypeFromFieldType,
  isDefined,
  removePropertiesFromRecord,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

type DashboardFilterChipDropdownProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
};

export const DashboardFilterChipDropdown = ({
  slot,
  representativeBinding,
}: DashboardFilterChipDropdownProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
  );

  const store = useStore();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();
  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const fieldMetadataItemIdUsedInDropdown = useAtomComponentStateCallbackState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const selectedOperandInDropdown = useAtomComponentStateCallbackState(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownCurrentRecordFilter =
    useAtomComponentStateCallbackState(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const subFieldNameUsedInDropdown = useAtomComponentStateCallbackState(
    subFieldNameUsedInDropdownComponentState,
  );

  const relationTargetFieldMetadataIdUsedInDropdown =
    useAtomComponentStateCallbackState(
      relationTargetFieldMetadataIdUsedInDropdownComponentState,
    );

  const { fieldMetadataItem: representativeFieldMetadataItem } =
    getFieldMetadataItemById({
      fieldMetadataId: representativeBinding.fieldMetadataId,
      objectMetadataItems,
    });

  if (!isDefined(representativeFieldMetadataItem)) {
    return null;
  }

  const slotValue = dashboardFilterValues[slot.id];
  const recordFilterId = getDashboardFilterRecordFilterId(slot.id);
  const filterType = getFilterTypeFromFieldType(
    representativeFieldMetadataItem.type,
  );
  const subFieldName = representativeBinding.subFieldName;
  const relationTargetFieldMetadataId =
    representativeBinding.relationTargetFieldMetadataId ?? null;

  const buildRecordFilterFromSlotValue = (
    value: DashboardFilterValue,
  ): RecordFilter => ({
    id: recordFilterId,
    fieldMetadataId: representativeFieldMetadataItem.id,
    type: filterType,
    operand: value.operand,
    value: value.value,
    displayValue: value.value,
    label: slot.label,
    subFieldName,
    relationTargetFieldMetadataId,
  });

  const labelValue = isDefined(slotValue)
    ? getRecordFilterChipLabelValue({
        recordFilter: buildRecordFilterFromSlotValue(slotValue),
      })
    : '';

  const clearSlotValue = () => {
    setDashboardFilterValues((previousDashboardFilterValues) =>
      isDefined(previousDashboardFilterValues[slot.id])
        ? removePropertiesFromRecord(previousDashboardFilterValues, [slot.id])
        : previousDashboardFilterValues,
    );
    store.set(currentRecordFilters, []);
    store.set(objectFilterDropdownCurrentRecordFilter, null);
  };

  // The reused filter inputs read the dropdown states, so they are seeded from the slot value on each open.
  const handleChipClick = () => {
    const recordFilter = isDefined(slotValue)
      ? buildRecordFilterFromSlotValue(slotValue)
      : null;

    const operand =
      recordFilter?.operand ??
      slot.defaultOperand ??
      getRecordFilterOperands({ filterType, subFieldName })[0] ??
      null;

    store.set(
      currentRecordFilters,
      isDefined(recordFilter) ? [recordFilter] : [],
    );
    store.set(
      fieldMetadataItemIdUsedInDropdown,
      representativeFieldMetadataItem.id,
    );
    store.set(selectedOperandInDropdown, operand);
    store.set(objectFilterDropdownCurrentRecordFilter, recordFilter);
    store.set(subFieldNameUsedInDropdown, subFieldName);
    store.set(
      relationTargetFieldMetadataIdUsedInDropdown,
      relationTargetFieldMetadataId,
    );
  };

  const handleRemove = () => {
    closeDropdown(dropdownId);
    clearSlotValue();
  };

  const handleDropdownClose = () => {
    const [currentRecordFilter] = store.get(currentRecordFilters);

    if (
      isDefined(currentRecordFilter) &&
      isRecordFilterConsideredEmpty(currentRecordFilter)
    ) {
      clearSlotValue();
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SortOrFilterChip
          testId={recordFilterId}
          labelKey={slot.label}
          labelValue={labelValue}
          Icon={getIcon(representativeFieldMetadataItem.icon)}
          onRemove={handleRemove}
          onClick={handleChipClick}
          type="filter"
        />
      }
      dropdownComponents={
        <DashboardFilterChipDropdownContent
          slotLabel={slot.label}
          dropdownId={dropdownId}
          recordFilterId={recordFilterId}
        />
      }
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onClose={handleDropdownClose}
    />
  );
};
