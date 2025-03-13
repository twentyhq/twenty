import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';

import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { MenuItemSelect, useIcons } from 'twenty-ui';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [, setObjectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
  );

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(fieldMetadataItemToSelect.id),
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const advancedFilterViewFilterId = useRecoilComponentValueV2(
    advancedFilterViewFilterIdComponentState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const { closeAdvancedFilterDropdown } = useAdvancedFilterDropdown(
    advancedFilterViewFilterId,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
  );

  const handleSelectFilter = (fieldMetadataItem: FieldMetadataItem) => {
    closeAdvancedFilterDropdown();

    setFieldMetadataItemIdUsedInDropdown(fieldMetadataItem.id);

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    if (filterType === 'RELATION' || filterType === 'SELECT') {
      setHotkeyScope(SingleRecordPickerHotkeyScope.SingleRecordPicker);
    }

    const defaultOperand = getRecordFilterOperands({
      filterType,
    })[0];

    setObjectFilterDropdownFilterIsSelected(true);

    const duplicateFilterInCurrentRecordFilters =
      findDuplicateRecordFilterInNonAdvancedRecordFilters({
        recordFilters: currentRecordFilters,
        fieldMetadataItemId: fieldMetadataItem.id,
      });

    const filterIsAlreadyInCurrentRecordFilters = isDefined(
      duplicateFilterInCurrentRecordFilters,
    );

    const isSimpleFilter = !isDefined(advancedFilterViewFilterId);

    if (isSimpleFilter && filterIsAlreadyInCurrentRecordFilters) {
      setSelectedFilter({
        ...duplicateFilterInCurrentRecordFilters,
      });

      setSelectedOperandInDropdown(
        duplicateFilterInCurrentRecordFilters.operand,
      );
    } else {
      setSelectedOperandInDropdown(defaultOperand);
    }
  };

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const shouldShowSubMenu = isCompositeField(fieldMetadataItemToSelect.type);

  const handleClick = () => {
    resetSelectedItem();

    const filterType = getFilterTypeFromFieldType(
      fieldMetadataItemToSelect.type,
    );

    if (isCompositeField(filterType)) {
      setObjectFilterDropdownSubMenuFieldType(filterType);

      setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemToSelect.id);
      setObjectFilterDropdownIsSelectingCompositeField(true);
    } else {
      handleSelectFilter(fieldMetadataItemToSelect);
    }
  };

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={handleClick}
      LeftIcon={Icon}
      text={fieldMetadataItemToSelect.label}
      hasSubMenu={shouldShowSubMenu}
    />
  );
};
