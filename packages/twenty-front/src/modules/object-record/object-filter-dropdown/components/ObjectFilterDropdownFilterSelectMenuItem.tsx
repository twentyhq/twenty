import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
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
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

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

  const { resetSelectedItem } = useSelectableList(OBJECT_FILTER_DROPDOWN_ID);

  const isSelectedItem = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    fieldMetadataItemToSelect.id,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
  );

  const handleSelectFilter = (fieldMetadataItem: FieldMetadataItem) => {
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

    if (filterIsAlreadyInCurrentRecordFilters) {
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
