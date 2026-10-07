import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
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
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { DashboardFilterChipDropdownContent } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdownContent';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/DashboardFilterSettingsSelectableItemIds';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import {
  getDashboardFilterRecordFilterId,
  getFilterTypeFromFieldType,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';

type DashboardFilterDefaultValueDropdownContentProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding | undefined;
  relationTargetObjectMetadataId: string | undefined;
};

export const DashboardFilterDefaultValueDropdownContent = ({
  slot,
  representativeBinding,
  relationTargetObjectMetadataId,
}: DashboardFilterDefaultValueDropdownContentProps) => {
  const { t } = useLingui();
  const store = useStore();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
  );

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const { setSelectedItemId } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );
  const setHasUserSelectedSidePanelListItem = useSetAtomState(
    hasUserSelectedSidePanelListItemState,
  );

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

  const { fieldMetadataItem: representativeFieldMetadataItem } = isDefined(
    representativeBinding,
  )
    ? getFieldMetadataItemById({
        fieldMetadataId: representativeBinding.fieldMetadataId,
        objectMetadataItems,
      })
    : { fieldMetadataItem: undefined };

  const subFieldName = representativeBinding?.subFieldName;
  const relationTargetFieldMetadataId =
    representativeBinding?.relationTargetFieldMetadataId ?? null;

  // Same rule as the chip: a RELATION slot bound only through charts' own ids gets the picker of the derived target.
  const isBoundThroughOwnId =
    slot.filterType === 'RELATION' &&
    isDefined(representativeFieldMetadataItem) &&
    !isManyToOneRelationField(representativeFieldMetadataItem);

  const recordSelectObjectNameSingular = isBoundThroughOwnId
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === relationTargetObjectMetadataId,
      )?.nameSingular
    : undefined;

  const defaultRecordFilter: RecordFilter | null =
    isDefined(representativeFieldMetadataItem) && isDefined(slot.defaultOperand)
      ? {
          id: getDashboardFilterRecordFilterId(slot.id),
          fieldMetadataId: representativeFieldMetadataItem.id,
          type: isBoundThroughOwnId
            ? 'RELATION'
            : getFilterTypeFromFieldType(representativeFieldMetadataItem.type),
          operand: slot.defaultOperand,
          value: slot.defaultValue ?? '',
          displayValue:
            slot.filterType === 'RELATION' ? '' : (slot.defaultValue ?? ''),
          label: slot.label,
          subFieldName,
          relationTargetFieldMetadataId,
        }
      : null;

  const getRelationDefaultValueLabel = (recordFilter: RecordFilter) => {
    const parsedValue = jsonRelationFilterValueSchema.safeParse(
      recordFilter.value,
    );

    if (!parsedValue.success) {
      return getOperandLabel(recordFilter.operand);
    }

    const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
      parsedValue.data;

    const selectedRecordCount = selectedRecordIds.length;

    const labelParts = [
      ...(isCurrentWorkspaceMemberSelected ? [t`Me`] : []),
      ...(selectedRecordCount > 0 ? [t`${selectedRecordCount} selected`] : []),
    ];

    return labelParts.length > 0
      ? labelParts.join(', ')
      : getOperandLabel(recordFilter.operand);
  };

  const getDefaultValueLabel = () => {
    if (!isDefined(representativeFieldMetadataItem)) {
      return t`Apply to a widget first`;
    }

    if (!isDefined(defaultRecordFilter)) {
      return t`None`;
    }

    if (slot.filterType === 'RELATION') {
      return getRelationDefaultValueLabel(defaultRecordFilter);
    }

    const chipLabelValue = getRecordFilterChipLabelValue({
      recordFilter: defaultRecordFilter,
    });

    return isNonEmptyString(chipLabelValue)
      ? chipLabelValue
      : getOperandLabel(defaultRecordFilter.operand);
  };

  // The reused filter inputs read the dropdown states, so they are seeded from the slot default on each open.
  const handleOpen = () => {
    setSelectedItemId(
      DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DEFAULT_VALUE,
    );
    setHasUserSelectedSidePanelListItem(true);

    if (!isDefined(representativeFieldMetadataItem)) {
      return;
    }

    const operand =
      defaultRecordFilter?.operand ??
      getRecordFilterOperands({
        filterType: slot.filterType,
        subFieldName,
      })[0] ??
      null;

    store.set(
      currentRecordFilters,
      isDefined(defaultRecordFilter) ? [defaultRecordFilter] : [],
    );
    store.set(
      fieldMetadataItemIdUsedInDropdown,
      representativeFieldMetadataItem.id,
    );
    store.set(selectedOperandInDropdown, operand);
    store.set(objectFilterDropdownCurrentRecordFilter, defaultRecordFilter);
    store.set(objectFilterDropdownSearchInput, '');
    store.set(subFieldNameUsedInDropdown, subFieldName);
    store.set(
      relationTargetFieldMetadataIdUsedInDropdown,
      relationTargetFieldMetadataId,
    );
  };

  const isDisabled = !isDefined(representativeFieldMetadataItem);

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <CommandMenuItem
          id={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DEFAULT_VALUE}
          label={t`Default value`}
          Icon={IconFilter}
          description={getDefaultValueLabel()}
          contextualTextPosition="right"
          hasSubMenu
          isSubMenuOpened={isDropdownOpen}
          disabled={isDisabled}
        />
      }
      dropdownComponents={
        <DashboardFilterChipDropdownContent
          slotLabel={slot.label}
          dropdownId={dropdownId}
          recordSelectObjectNameSingular={recordSelectObjectNameSingular}
        />
      }
      dropdownPlacement="bottom-end"
      disableClickForClickableComponent={isDisabled}
      onOpen={handleOpen}
      middlewareBoundaryPadding={{ right: 0, left: 0 }}
    />
  );
};
