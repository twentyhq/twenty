import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { DashboardFilterChipButton } from '@/page-layout/dashboard-filters/components/DashboardFilterChipButton';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import { DashboardFilterRelationChipButton } from '@/page-layout/dashboard-filters/components/DashboardFilterRelationChipButton';
import { useClearDashboardFilterCrossFilterMarker } from '@/page-layout/dashboard-filters/hooks/useClearDashboardFilterCrossFilterMarker';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { type DashboardFilterSlotWidgetCounts } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotWidgetCounts';
import { isDashboardFilterSlotCrossFiltered } from '@/page-layout/dashboard-filters/utils/isDashboardFilterSlotCrossFiltered';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { plural } from '@lingui/core/macro';
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
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type DashboardFilterChipDropdownProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
  relationTargetObjectNameSingular: string | undefined;
  widgetCounts: DashboardFilterSlotWidgetCounts;
  onEdit?: () => void;
};

export const DashboardFilterChipDropdown = ({
  slot,
  representativeBinding,
  relationTargetObjectNameSingular,
  widgetCounts,
  onEdit,
}: DashboardFilterChipDropdownProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
  );

  const store = useStore();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const dashboardFilterCrossFilterValues = useAtomComponentStateValue(
    dashboardFilterCrossFilterValuesComponentState,
  );

  const { clearDashboardFilterCrossFilterMarker } =
    useClearDashboardFilterCrossFilterMarker();

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

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

  const objectFilterDropdownSearchInput = useAtomComponentStateCallbackState(
    objectFilterDropdownSearchInputComponentState,
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

  const isCrossFiltered = isDashboardFilterSlotCrossFiltered({
    slotId: slot.id,
    dashboardFilterValues,
    dashboardFilterCrossFilterValues,
  });

  // A RELATION slot whose only bindings are charts' own id fields still edits record ids: the picker and the
  // label are driven by the derived target object instead of a relation on the field.
  const isBoundThroughOwnId =
    slot.filterType === 'RELATION' &&
    !isManyToOneRelationField(representativeFieldMetadataItem);

  const recordSelectObjectNameSingular = isBoundThroughOwnId
    ? relationTargetObjectNameSingular
    : undefined;

  const filterType = isBoundThroughOwnId
    ? 'RELATION'
    : getFilterTypeFromFieldType(representativeFieldMetadataItem.type);
  const subFieldName = representativeBinding.subFieldName;
  const relationTargetFieldMetadataId =
    representativeBinding.relationTargetFieldMetadataId ?? null;

  // A relation value is JSON that the chip label resolves from records; left as displayValue it would surface when a record is gone.
  const buildRecordFilterFromSlotValue = (
    value: DashboardFilterValue,
  ): RecordFilter => ({
    id: recordFilterId,
    fieldMetadataId: representativeFieldMetadataItem.id,
    type: filterType,
    operand: value.operand,
    value: value.value,
    displayValue: filterType === 'RELATION' ? '' : value.value,
    label: slot.label,
    subFieldName,
    relationTargetFieldMetadataId,
  });

  const recordFilter = isDefined(slotValue)
    ? buildRecordFilterFromSlotValue(slotValue)
    : null;

  const clearSlotValue = () => {
    setDashboardFilterValues((previousDashboardFilterValues) =>
      isDefined(previousDashboardFilterValues[slot.id])
        ? removePropertiesFromRecord(previousDashboardFilterValues, [slot.id])
        : previousDashboardFilterValues,
    );
    clearDashboardFilterCrossFilterMarker(slot.id);
    store.set(currentRecordFilters, []);
    store.set(objectFilterDropdownCurrentRecordFilter, null);
  };

  // The reused filter inputs read the dropdown states, so they are seeded from the slot value on each open.
  const handleChipClick = () => {
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
    store.set(objectFilterDropdownSearchInput, '');
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

  const handleEditClick = () => {
    closeDropdown(dropdownId);
    onEdit?.();
  };

  // The scratch is dropped on close so a later effect run can never replay a value the viewer has since
  // replaced through Reset or a chart; opening re-seeds it from the slot value.
  const handleDropdownClose = () => {
    const [currentRecordFilter] = store.get(currentRecordFilters);

    if (
      isDefined(currentRecordFilter) &&
      isRecordFilterConsideredEmpty(currentRecordFilter)
    ) {
      clearSlotValue();
      return;
    }

    store.set(currentRecordFilters, []);
    store.set(objectFilterDropdownCurrentRecordFilter, null);
  };

  const ChipIcon = getIcon(representativeFieldMetadataItem.icon);

  const { boundWidgetCount, graphWidgetCount } = widgetCounts;

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <Tooltip
          delay={TooltipDelay.mediumDelay}
          content={plural(graphWidgetCount, {
            one: `Applies to ${boundWidgetCount} of # widget`,
            other: `Applies to ${boundWidgetCount} of # widgets`,
          })}
          side="bottom"
          disabled={isDropdownOpen}
        >
          <div>
            {slot.filterType === 'RELATION' &&
            (!isBoundThroughOwnId ||
              isDefined(relationTargetObjectNameSingular)) ? (
              <DashboardFilterRelationChipButton
                slot={slot}
                recordFilter={recordFilter}
                relationObjectNameSingular={relationTargetObjectNameSingular}
                Icon={ChipIcon}
                testId={recordFilterId}
                onClick={handleChipClick}
                onRemove={handleRemove}
                isCrossFilter={isCrossFiltered}
              />
            ) : (
              <DashboardFilterChipButton
                slot={slot}
                recordFilter={recordFilter}
                Icon={ChipIcon}
                testId={recordFilterId}
                onClick={handleChipClick}
                onRemove={handleRemove}
                isCrossFilter={isCrossFiltered}
              />
            )}
          </div>
        </Tooltip>
      }
      dropdownComponents={
        <DashboardFilterChipDropdownContent
          slotLabel={slot.label}
          dropdownId={dropdownId}
          recordSelectObjectNameSingular={recordSelectObjectNameSingular}
          onEditClick={isDefined(onEdit) ? handleEditClick : undefined}
        />
      }
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onClose={handleDropdownClose}
    />
  );
};
