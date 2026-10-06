import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { setObjectFilterDropdownStatesFromRecordFilter } from '@/object-record/object-filter-dropdown/utils/setObjectFilterDropdownStatesFromRecordFilter';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import {
  Dropdown,
  type DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { useStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import {
  buildRecordFilterFromDashboardFilterSlot,
  getDashboardFilterSlotRecordFilterId,
  isDefined,
} from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/icon';

export type DashboardFilterValueDropdownClickableComponentProps = {
  currentRecordFilter: RecordFilter | undefined;
  labelValue: string;
  Icon: IconComponent;
  dropdownId: string;
  onClick: () => void;
};

type DashboardFilterValueDropdownProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
  value: DashboardFilterValue | null | undefined;
  onValueChange: (value: DashboardFilterValue) => void;
  instanceId: string;
  renderClickableComponent: (
    props: DashboardFilterValueDropdownClickableComponentProps,
  ) => ReactNode;
} & Pick<DropdownProps, 'dropdownPlacement' | 'dropdownOffset'>;

// Hosts the regular filter inputs for a slot value, wherever that value lives: the bar chip edits the current value, the editor edits the default one.
export const DashboardFilterValueDropdown = ({
  slot,
  representativeBinding,
  value,
  onValueChange,
  instanceId,
  renderClickableComponent,
  dropdownPlacement = 'bottom-start',
  dropdownOffset,
}: DashboardFilterValueDropdownProps) => {
  const dropdownId = `${instanceId}-dropdown`;

  const store = useStore();

  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemByIdOrThrow(representativeBinding.fieldMetadataId);

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const { getIcon } = useIcons();

  // displayValue stays empty: the label is derived from the value at render time.
  const currentRecordFilter: RecordFilter | undefined = isDefined(value)
    ? {
        ...buildRecordFilterFromDashboardFilterSlot({
          slot,
          binding: representativeBinding,
          value,
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

  const handleClickableComponentClick = () => {
    const recordFilterForDropdown = buildRecordFilterForDropdown();

    store.set(currentRecordFiltersComponentState.atomFamily({ instanceId }), [
      recordFilterForDropdown,
    ]);

    setObjectFilterDropdownStatesFromRecordFilter({
      store,
      objectFilterDropdownInstanceId: instanceId,
      recordFilter: recordFilterForDropdown,
      fieldMetadataItemId: fieldMetadataItem.id,
    });
  };

  // Fired by useUpsertRecordFilter right after the filter inputs wrote the dropdown's own record filter.
  const handleRecordFilterUpdate = () => {
    const [updatedRecordFilter] = store.get(
      currentRecordFiltersComponentState.atomFamily({ instanceId }),
    );

    if (!isDefined(updatedRecordFilter)) {
      return;
    }

    onValueChange({
      operand: updatedRecordFilter.operand,
      value: updatedRecordFilter.value,
    });
  };

  const labelValue = isDefined(currentRecordFilter)
    ? getRecordFilterChipLabelValue({ recordFilter: currentRecordFilter })
    : '';

  return (
    <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <AdvancedFilterContext.Provider
          value={{ onUpdate: handleRecordFilterUpdate, objectMetadataItem }}
        >
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={renderClickableComponent({
              currentRecordFilter,
              labelValue,
              Icon: getIcon(fieldMetadataItem.icon),
              dropdownId,
              onClick: handleClickableComponentClick,
            })}
            dropdownComponents={
              <DashboardFilterChipDropdownContent
                slot={slot}
                dropdownId={dropdownId}
              />
            }
            dropdownOffset={dropdownOffset}
            dropdownPlacement={dropdownPlacement}
          />
        </AdvancedFilterContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </RecordFiltersComponentInstanceContext.Provider>
  );
};
