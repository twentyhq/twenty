import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { AdvancedFilterFieldSelectSearchInput } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectSearchInput';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { ObjectFilterDropdownFilterSelectMenuItemV2 } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItemV2';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

type AdvancedFilterFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterFieldSelectMenuProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const [objectFilterDropdownSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );
  const visibleColumnsIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
  );

  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter((fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );

  const visibleColumnsFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((a, b) => {
      return visibleColumnsIds.indexOf(a.id) - visibleColumnsIds.indexOf(b.id);
    })
    .filter((fieldMetadataItem) =>
      visibleColumnsIds.includes(fieldMetadataItem.id),
    );

  const hiddenColumnsFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter(
      (fieldMetadataItem) => !visibleColumnsIds.includes(fieldMetadataItem.id),
    );

  const selectableFieldMetadataItemIds = filterableFieldMetadataItems.map(
    (fieldMetadataItem) => fieldMetadataItem.id,
  );

  const { resetSelectedItem } = useSelectableList(OBJECT_FILTER_DROPDOWN_ID);

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const handleEnter = (fieldMetadataItemId: string) => {
    const selectedFieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItem) => fieldMetadataItem.id === fieldMetadataItemId,
    );

    if (!isDefined(selectedFieldMetadataItem)) {
      return;
    }

    handleFieldMetadataItemSelect(selectedFieldMetadataItem);
  };

  const handleFieldMetadataItemSelect = (
    selectedFieldMetadataItem: FieldMetadataItem,
  ) => {
    resetSelectedItem();

    const filterType = getFilterTypeFromFieldType(
      selectedFieldMetadataItem.type,
    );

    if (isCompositeField(filterType)) {
      setObjectFilterDropdownSubMenuFieldType(filterType);

      setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
      setObjectFilterDropdownIsSelectingCompositeField(true);
    } else {
      selectFieldUsedInAdvancedFilterDropdown({
        fieldMetadataItemId: selectedFieldMetadataItem.id,
        recordFilterId,
      });

      closeAdvancedFilterFieldSelectDropdown();
    }
  };

  const shouldShowSeparator =
    visibleColumnsFieldMetadataItems.length > 0 &&
    hiddenColumnsFieldMetadataItems.length > 0;

  return (
    <>
      <AdvancedFilterFieldSelectSearchInput />
      <SelectableList
        hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}
        selectableItemIdArray={selectableFieldMetadataItemIds}
        selectableListInstanceId={OBJECT_FILTER_DROPDOWN_ID}
        onEnter={handleEnter}
      >
        <DropdownMenuItemsContainer>
          {visibleColumnsFieldMetadataItems.map(
            (visibleFieldMetadataItem, index) => (
              <SelectableItem
                itemId={visibleFieldMetadataItem.id}
                key={`visible-select-filter-${index}`}
              >
                <ObjectFilterDropdownFilterSelectMenuItemV2
                  fieldMetadataItemToSelect={visibleFieldMetadataItem}
                  onClick={handleFieldMetadataItemSelect}
                />
              </SelectableItem>
            ),
          )}
          {shouldShowSeparator && <DropdownMenuSeparator />}
          {hiddenColumnsFieldMetadataItems.map(
            (hiddenFieldMetadataItem, index) => (
              <SelectableItem
                itemId={hiddenFieldMetadataItem.id}
                key={`hidden-select-filter-${index}`}
              >
                <ObjectFilterDropdownFilterSelectMenuItemV2
                  fieldMetadataItemToSelect={hiddenFieldMetadataItem}
                  onClick={handleFieldMetadataItemSelect}
                />
              </SelectableItem>
            ),
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </>
  );
};
