import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { setObjectFilterDropdownStatesFromRecordFilter } from '@/object-record/object-filter-dropdown/utils/setObjectFilterDropdownStatesFromRecordFilter';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { buildRecordFilterFromDashboardFilterValue } from '@/page-layout/dashboard-filters/utils/buildRecordFilterFromDashboardFilterValue';
import { getDashboardFilterChipComponentInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChipComponentInstanceId';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { useStore } from 'jotai';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  isDefined,
  removePropertiesFromRecord,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

type DashboardFilterChipProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
};

export const DashboardFilterChip = ({
  slot,
  representativeBinding,
}: DashboardFilterChipProps) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const chipInstanceId = getDashboardFilterChipComponentInstanceId({
    pageLayoutInstanceId,
    slotId: slot.id,
  });

  const dropdownId = `${chipInstanceId}-dropdown`;

  const store = useStore();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const dashboardFilterValue = dashboardFilterValues[slot.id];

  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemByIdOrThrow(representativeBinding.fieldMetadataId);

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const currentRecordFilter = isDefined(dashboardFilterValue)
    ? buildRecordFilterFromDashboardFilterValue({
        slot,
        binding: representativeBinding,
        fieldMetadataItem,
        value: dashboardFilterValue,
      })
    : undefined;

  // Without a value, the inputs are seeded like a freshly added view filter; nothing is applied until the user changes it.
  const buildRecordFilterForDropdown = (): RecordFilter => {
    if (isDefined(currentRecordFilter)) {
      return currentRecordFilter;
    }

    const { newRecordFilter } =
      createEmptyRecordFilterFromFieldMetadataItem(fieldMetadataItem);

    return {
      ...newRecordFilter,
      id: getDashboardFilterRecordFilterId(slot.id),
      label: slot.label,
      subFieldName: representativeBinding.subFieldName,
      relationTargetFieldMetadataId:
        representativeBinding.relationTargetFieldMetadataId,
    };
  };

  const handleChipClick = () => {
    const recordFilterForDropdown = buildRecordFilterForDropdown();

    store.set(
      currentRecordFiltersComponentState.atomFamily({
        instanceId: chipInstanceId,
      }),
      [recordFilterForDropdown],
    );

    setObjectFilterDropdownStatesFromRecordFilter({
      store,
      objectFilterDropdownInstanceId: chipInstanceId,
      recordFilter: recordFilterForDropdown,
      fieldMetadataItemId: fieldMetadataItem.id,
    });
  };

  // Fired by useUpsertRecordFilter right after the filter inputs wrote the chip's own record filter.
  const handleRecordFilterUpdate = () => {
    const [updatedRecordFilter] = store.get(
      currentRecordFiltersComponentState.atomFamily({
        instanceId: chipInstanceId,
      }),
    );

    if (!isDefined(updatedRecordFilter)) {
      return;
    }

    setDashboardFilterValues((previousDashboardFilterValues) => ({
      ...previousDashboardFilterValues,
      [slot.id]: {
        operand: updatedRecordFilter.operand,
        value: updatedRecordFilter.value,
      },
    }));
  };

  const handleRemove = () => {
    closeDropdown(dropdownId);

    setDashboardFilterValues((previousDashboardFilterValues) =>
      removePropertiesFromRecord(previousDashboardFilterValues, [slot.id]),
    );
  };

  const labelValue = isDefined(currentRecordFilter)
    ? getRecordFilterChipLabelValue({ recordFilter: currentRecordFilter })
    : '';

  return (
    <RecordFiltersComponentInstanceContext.Provider
      value={{ instanceId: chipInstanceId }}
    >
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: chipInstanceId }}
      >
        <AdvancedFilterContext.Provider
          value={{ onUpdate: handleRecordFilterUpdate, objectMetadataItem }}
        >
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <SortOrFilterChip
                testId={chipInstanceId}
                labelKey={slot.label}
                labelValue={labelValue}
                Icon={getIcon(fieldMetadataItem.icon)}
                onRemove={handleRemove}
                onClick={handleChipClick}
                type="filter"
              />
            }
            dropdownComponents={
              <DashboardFilterChipDropdownContent slot={slot} />
            }
            dropdownOffset={{ y: 8, x: 0 }}
            dropdownPlacement="bottom-start"
          />
        </AdvancedFilterContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </RecordFiltersComponentInstanceContext.Provider>
  );
};
