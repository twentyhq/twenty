import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { AdvancedFilterFieldSelectSearchInput } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectSearchInput';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { ObjectFilterDropdownFilterSelectMenuItem } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectMenuItem';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';

type AdvancedFilterFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterFieldSelectMenuProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const {
    closeAdvancedFilterFieldSelectDropdown,
    advancedFilterFieldSelectDropdownId,
  } = useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const [objectFilterDropdownSearchInput] = useRecoilComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleTableColumns = useRecoilComponentValue(
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

  const { resetSelectedItem } = useSelectableList(
    advancedFilterFieldSelectDropdownId,
  );

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentState(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
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

    if (isCompositeFieldType(filterType)) {
      setObjectFilterDropdownSubMenuFieldType(filterType);

      setFieldMetadataItemIdUsedInDropdown(selectedFieldMetadataItem.id);
      setObjectFilterDropdownIsSelectingCompositeField(true);
    } else {
      closeAdvancedFilterFieldSelectDropdown();
    }
  };

  const shouldShowVisibleFields = visibleColumnsFieldMetadataItems.length > 0;
  const shouldShowHiddenFields = hiddenColumnsFieldMetadataItems.length > 0;

  const shouldShowSeparator =
    visibleColumnsFieldMetadataItems.length > 0 &&
    hiddenColumnsFieldMetadataItems.length > 0;

  const selectableItemIdArray = [
    ...visibleColumnsFieldMetadataItems.map(
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
              {visibleColumnsFieldMetadataItems.map(
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
            {visibleColumnsFieldMetadataItems.length > 0 && (
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
