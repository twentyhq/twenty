import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterFieldSelectSearchInput } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectSearchInput';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';

type AdvancedFilterFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterFieldSelectMenuProps) => {
  const {
    closeAdvancedFilterFieldSelectDropdown,
    advancedFilterFieldSelectDropdownId,
  } = useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const [objectFilterDropdownSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const { objectMetadataItem } = useContext(AdvancedFilterContext);

  const { filterableFieldMetadataItems: filterableFieldMetadataItems } =
    useFilterableFieldMetadataItems(objectMetadataItem.id);

  const visibleRecordFields = useRecoilComponentSelectorValueV2(
    visibleRecordFieldsComponentSelector,
  );

  const visibleFieldMetadataItemIds = visibleRecordFields.map(
    (recordField) => recordField.fieldMetadataItemId,
  );

  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter((fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );

  const visibleFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .toSorted((a, b) => {
      return (
        visibleFieldMetadataItemIds.indexOf(a.id) -
        visibleFieldMetadataItemIds.indexOf(b.id)
      );
    })
    .filter((fieldMetadataItem) =>
      visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
    );

  const hiddenColumnsFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter(
      (fieldMetadataItem) =>
        !visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
    );

  const { resetSelectedItem } = useSelectableList(
    advancedFilterFieldSelectDropdownId,
  );

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      advancedFilterFieldSelectDropdownId,
    );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const handleFieldMetadataItemSelect = (
    selectedFieldMetadataItem: FieldMetadataItem,
  ) => {
    resetSelectedItem();

    const filterType = getFilterTypeFromFieldType(
      selectedFieldMetadataItem.type,
    );

    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: selectedFieldMetadataItem.id,
      recordFilterId,
    });

    if (isCompositeFilterableFieldType(filterType)) {
      setObjectFilterDropdownSubMenuFieldType(filterType);

      setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
      setObjectFilterDropdownIsSelectingCompositeField(true);
    } else {
      closeAdvancedFilterFieldSelectDropdown();
    }
  };

  const shouldShowVisibleFields = visibleFieldMetadataItems.length > 0;
  const shouldShowHiddenFields = hiddenColumnsFieldMetadataItems.length > 0;

  const shouldShowSeparator =
    visibleFieldMetadataItems.length > 0 &&
    hiddenColumnsFieldMetadataItems.length > 0;

  const selectableItemIdArray = [
    ...visibleFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    ...hiddenColumnsFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
  ];

  const { t } = useLingui();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <AdvancedFilterFieldSelectSearchInput />
      <SelectableList
        focusId={advancedFilterFieldSelectDropdownId}
        selectableItemIdArray={selectableItemIdArray}
        selectableListInstanceId={advancedFilterFieldSelectDropdownId}
      >
        {shouldShowVisibleFields && (
          <>
            <DropdownMenuSectionLabel label={t`Visible fields`} />
            <DropdownMenuItemsContainer>
              {visibleFieldMetadataItems.map(
                (visibleFieldMetadataItem, index) => (
                  <SelectableListItem
                    itemId={visibleFieldMetadataItem.id}
                    key={`visible-select-filter-${index}`}
                    onEnter={() => {
                      handleFieldMetadataItemSelect(visibleFieldMetadataItem);
                    }}
                  >
                    <ObjectFilterDropdownFilterSelectMenuItem
                      fieldMetadataItemToSelect={visibleFieldMetadataItem}
                      onClick={handleFieldMetadataItemSelect}
                    />
                  </SelectableListItem>
                ),
              )}
            </DropdownMenuItemsContainer>
          </>
        )}
        {shouldShowSeparator && <DropdownMenuSeparator />}
        {shouldShowHiddenFields && (
          <>
            {visibleFieldMetadataItems.length > 0 && (
              <DropdownMenuSectionLabel label={t`Hidden fields`} />
            )}
            <DropdownMenuItemsContainer>
              {hiddenColumnsFieldMetadataItems.map(
                (hiddenFieldMetadataItem, index) => (
                  <SelectableListItem
                    itemId={hiddenFieldMetadataItem.id}
                    key={`hidden-select-filter-${index}`}
                    onEnter={() => {
                      handleFieldMetadataItemSelect(hiddenFieldMetadataItem);
                    }}
                  >
                    <ObjectFilterDropdownFilterSelectMenuItem
                      fieldMetadataItemToSelect={hiddenFieldMetadataItem}
                      onClick={handleFieldMetadataItemSelect}
                    />
                  </SelectableListItem>
                ),
              )}
            </DropdownMenuItemsContainer>
          </>
        )}
      </SelectableList>
    </DropdownContent>
  );
};
