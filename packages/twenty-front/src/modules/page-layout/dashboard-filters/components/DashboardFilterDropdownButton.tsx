import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { setObjectFilterDropdownStatesFromRecordFilter } from '@/object-record/object-filter-dropdown/utils/setObjectFilterDropdownStatesFromRecordFilter';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import { DashboardFilterRelationChip } from '@/page-layout/dashboard-filters/components/DashboardFilterRelationChip';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { getDashboardFilterChipComponentInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChipComponentInstanceId';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { useStore } from 'jotai';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import {
  buildRecordFilterFromDashboardFilterSlot,
  getDashboardFilterSlotRecordFilterId,
  isDefined,
  removePropertiesFromRecord,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

type DashboardFilterDropdownButtonProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
  boundChartCount: number;
  chartCount: number;
};

export const DashboardFilterDropdownButton = ({
  slot,
  representativeBinding,
  boundChartCount,
  chartCount,
}: DashboardFilterDropdownButtonProps) => {
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

  // displayValue stays empty: the chip label is derived from the value at render time.
  const currentRecordFilter: RecordFilter | undefined = isDefined(
    dashboardFilterValue,
  )
    ? {
        ...buildRecordFilterFromDashboardFilterSlot({
          slot,
          binding: representativeBinding,
          value: dashboardFilterValue,
          fieldMetadataItem,
        }),
        // The shared filter allows a null group id, the front one does not.
        recordFilterGroupId: undefined,
        label: slot.label,
        displayValue: '',
      }
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
      id: getDashboardFilterSlotRecordFilterId(slot.id),
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

  const ChipIcon = getIcon(fieldMetadataItem.icon);

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
              isDefined(currentRecordFilter) &&
              currentRecordFilter.type === 'RELATION' ? (
                <DashboardFilterRelationChip
                  slot={slot}
                  recordFilter={currentRecordFilter}
                  Icon={ChipIcon}
                  testId={chipInstanceId}
                  boundChartCount={boundChartCount}
                  chartCount={chartCount}
                  onClick={handleChipClick}
                  onRemove={handleRemove}
                />
              ) : (
                <DashboardFilterChip
                  slot={slot}
                  labelValue={labelValue}
                  Icon={ChipIcon}
                  testId={chipInstanceId}
                  boundChartCount={boundChartCount}
                  chartCount={chartCount}
                  onClick={handleChipClick}
                  onRemove={handleRemove}
                />
              )
            }
            dropdownComponents={
              <DashboardFilterChipDropdownContent
                slot={slot}
                dropdownId={dropdownId}
              />
            }
            dropdownOffset={{ y: 8, x: 0 }}
            dropdownPlacement="bottom-start"
          />
        </AdvancedFilterContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </RecordFiltersComponentInstanceContext.Provider>
  );
};
