import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterFieldSelectSearchInput } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectSearchInput';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownIsSelectingRelationTargetFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationTargetFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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

  const [objectFilterDropdownSearchInput] = useAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  const { objectMetadataItem } = useContext(AdvancedFilterContext);

  const { filterableFieldMetadataItems: filterableFieldMetadataItems } =
    useFilterableFieldMetadataItems(objectMetadataItem.id);

  const visibleRecordFields = useAtomComponentSelectorValue(
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

  const { applyAdvancedFilterSourceField } =
    useApplyAdvancedFilterSourceField();

  const [, setObjectFilterDropdownSubMenuFieldType] = useAtomComponentState(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useAtomComponentState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [, setObjectFilterDropdownIsSelectingRelationTargetField] =
    useAtomComponentState(
      objectFilterDropdownIsSelectingRelationTargetFieldComponentState,
    );

  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();

  const handleFieldMetadataItemSelect = (
    selectedFieldMetadataItem: FieldMetadataItem,
  ) => {
    resetSelectedItem();

    const filterType = getFilterTypeFromFieldType(
      selectedFieldMetadataItem.type,
    );

    const isRelationTraversalField = isManyToOneRelationField(
      selectedFieldMetadataItem,
    );

    const compositeSubMenuFieldType =
      !isRelationTraversalField && isCompositeFilterableFieldType(filterType)
        ? filterType
        : null;

    // For sub-menu paths (composite or relation traversal) we only stage
    // the source field in the dropdown state and open the sub-menu —
    // upsertRecordFilter happens in the sub-menu's hook once the user
    // makes the final choice. Otherwise navigating back from the sub-menu
    // would leave an orphan partial filter in the chip list.
    if (isRelationTraversalField) {
      setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
      setObjectFilterDropdownIsSelectingRelationTargetField(true);
      return;
    }

    if (compositeSubMenuFieldType !== null) {
      setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
      setObjectFilterDropdownSubMenuFieldType(compositeSubMenuFieldType);
      setObjectFilterDropdownIsSelectingCompositeField(true);
      return;
    }

    applyAdvancedFilterSourceField({
      sourceFieldMetadataItem: selectedFieldMetadataItem,
      recordFilterId,
    });

    pushFocusForLeafFieldValuePicker(selectedFieldMetadataItem);

    closeAdvancedFilterFieldSelectDropdown();
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
