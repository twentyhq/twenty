import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useCloseSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useCloseSortDropdown';
import { useResetRecordSortDropdownSearchInput } from '@/object-record/object-sort-dropdown/hooks/useResetRecordSortDropdownSearchInput';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { isRecordSortDirectionDropdownMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionDropdownMenuUnfoldedComponentState';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import {
  RECORD_SORT_DIRECTIONS,
  RecordSortDirection,
} from '@/object-record/record-sort/types/RecordSortDirection';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconX, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

export const ObjectSortDropdownButton = () => {
  const { resetRecordSortDropdownSearchInput } =
    useResetRecordSortDropdownSearchInput();

  const setObjectSortDropdownSearchInput = useSetRecoilComponentState(
    objectSortDropdownSearchInputComponentState,
  );

  const { resetSortDropdown } = useResetSortDropdown();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const objectSortDropdownSearchInput = useRecoilComponentValue(
    objectSortDropdownSearchInputComponentState,
  );

  const sortableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForSortFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { getIcon } = useIcons();

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );
  const visibleColumnsFieldMetadataIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
  );
  const hiddenTableColumns = useRecoilComponentValue(
    hiddenTableColumnsComponentSelector,
    recordIndexId,
  );
  const hiddenColumnFieldMetadataIds = hiddenTableColumns.map(
    (column) => column.fieldMetadataId,
  );

  const filteredSearchInputFieldMetadataItems =
    sortableFieldMetadataItems.filter((item) =>
      item.label
        .toLocaleLowerCase()
        .includes(objectSortDropdownSearchInput.toLocaleLowerCase()),
    );

  const visibleFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((fieldMetadataItemA, fieldMetadataItemB) => {
      return (
        visibleColumnsFieldMetadataIds.indexOf(fieldMetadataItemA.id) -
        visibleColumnsFieldMetadataIds.indexOf(fieldMetadataItemB.id)
      );
    })
    .filter((fieldMetadataItem) =>
      visibleColumnsFieldMetadataIds.includes(fieldMetadataItem.id),
    );

  const hiddenFieldMetadataItems = filteredSearchInputFieldMetadataItems
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.label.localeCompare(fieldMetadataItemB.label),
    )
    .filter((fieldMetadataItem) =>
      hiddenColumnFieldMetadataIds.includes(fieldMetadataItem.id),
    );

  const shouldShowSeparator =
    visibleFieldMetadataItems.length > 0 && hiddenFieldMetadataItems.length > 0;

  const handleDropdownButtonClose = () => {
    resetRecordSortDropdownSearchInput();
    resetSortDropdown();
  };

  const handleDropdownOpen = () => {
    resetSortDropdown();
    setSelectedItemId(selectableItemIdArray[0]);
  };

  const { closeSortDropdown } = useCloseSortDropdown();

  const { upsertRecordSort } = useUpsertRecordSort();

  const handleAddSort = (fieldMetadataItem: FieldMetadataItem) => {
    setObjectSortDropdownSearchInput('');
    closeSortDropdown();
    upsertRecordSort({
      id: v4(),
      fieldMetadataId: fieldMetadataItem.id,
      direction: selectedRecordSortDirection,
    });
  };

  const [selectedRecordSortDirection, setSelectedRecordSortDirection] =
    useRecoilComponentState(selectedRecordSortDirectionComponentState);

  const setIsRecordSortDirectionMenuUnfolded = useSetRecoilComponentState(
    isRecordSortDirectionDropdownMenuUnfoldedComponentState,
  );

  const handleSortDirectionClick = (sortDirection: RecordSortDirection) => {
    setSelectedRecordSortDirection(sortDirection);
    setIsRecordSortDirectionMenuUnfolded(false);
  };

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const { t } = useLingui();

  const selectableItemIdArray = [
    ...visibleFieldMetadataItems.map((item) => item.id),
    ...hiddenFieldMetadataItems.map((item) => item.id),
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const setSelectedItemId = useSetRecoilComponentState(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const shouldShowHiddenFields = hiddenFieldMetadataItems.length > 0;
  const shouldShowVisibleFields = visibleFieldMetadataItems.length > 0;

  return (
    <Dropdown
      dropdownId={OBJECT_SORT_DROPDOWN_ID}
      dropdownOffset={{ y: 8 }}
      onOpen={handleDropdownOpen}
      clickableComponent={
        <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
          <Trans>Sort</Trans>
        </StyledHeaderDropdownButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
          <DropdownMenuHeader
            StartComponent={
              <DropdownMenuHeaderLeftComponent
                onClick={() => closeSortDropdown()}
                Icon={IconX}
              />
            }
          >
            {t`Sort`}
          </DropdownMenuHeader>
          <DropdownMenuInnerSelect
            dropdownId="record-sort-direction-dropdown"
            options={RECORD_SORT_DIRECTIONS.map((sortDirection) => ({
              value: sortDirection,
              label: sortDirection === 'asc' ? t`Ascending` : t`Descending`,
            }))}
            selectedOption={{
              value: selectedRecordSortDirection,
              label:
                selectedRecordSortDirection === 'asc'
                  ? t`Ascending`
                  : t`Descending`,
            }}
            onChange={(sortDirection) =>
              handleSortDirectionClick(
                sortDirection.value as RecordSortDirection,
              )
            }
            widthInPixels={GenericDropdownContentWidth.ExtraLarge}
          />
          <DropdownMenuSeparator />
          <DropdownMenuSearchInput
            autoFocus
            value={objectSortDropdownSearchInput}
            placeholder={t`Search fields`}
            onChange={(event) =>
              setObjectSortDropdownSearchInput(event.target.value)
            }
          />
          <SelectableList
            selectableListInstanceId={OBJECT_SORT_DROPDOWN_ID}
            selectableItemIdArray={selectableItemIdArray}
            focusId={OBJECT_SORT_DROPDOWN_ID}
          >
            {shouldShowVisibleFields && (
              <>
                <DropdownMenuSectionLabel label={t`Visible fields`} />
                <DropdownMenuItemsContainer>
                  {visibleFieldMetadataItems.map(
                    (visibleFieldMetadataItem, index) => (
                      <SelectableListItem
                        key={visibleFieldMetadataItem.id}
                        itemId={visibleFieldMetadataItem.id}
                        onEnter={() => handleAddSort(visibleFieldMetadataItem)}
                      >
                        <MenuItem
                          focused={
                            selectedItemId === visibleFieldMetadataItem.id
                          }
                          testId={`visible-select-sort-${index}`}
                          onClick={() =>
                            handleAddSort(visibleFieldMetadataItem)
                          }
                          LeftIcon={getIcon(visibleFieldMetadataItem.icon)}
                          text={visibleFieldMetadataItem.label}
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
                <DropdownMenuSectionLabel label={t`Hidden fields`} />
                <DropdownMenuItemsContainer>
                  {hiddenFieldMetadataItems.map(
                    (hiddenFieldMetadataItem, index) => (
                      <SelectableListItem
                        key={hiddenFieldMetadataItem.id}
                        itemId={hiddenFieldMetadataItem.id}
                        onEnter={() => handleAddSort(hiddenFieldMetadataItem)}
                      >
                        <MenuItem
                          focused={
                            selectedItemId === hiddenFieldMetadataItem.id
                          }
                          testId={`hidden-select-sort-${index}`}
                          onClick={() => handleAddSort(hiddenFieldMetadataItem)}
                          LeftIcon={getIcon(hiddenFieldMetadataItem.icon)}
                          text={hiddenFieldMetadataItem.label}
                        />
                      </SelectableListItem>
                    ),
                  )}
                </DropdownMenuItemsContainer>
              </>
            )}
          </SelectableList>
        </DropdownContent>
      }
      onClose={handleDropdownButtonClose}
    />
  );
};
