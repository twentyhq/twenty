import styled from '@emotion/styled';

import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useCloseSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useCloseSortDropdown';
import { useResetRecordSortDropdownSearchInput } from '@/object-record/object-sort-dropdown/hooks/useResetRecordSortDropdownSearchInput';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useToggleSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useToggleSortDropdown';
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
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconChevronDown, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledSelectedSortDirectionContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  border-radius: ${({ theme }) => theme.border.radius.md};

  position: absolute;
  top: 32px;
  width: 100%;
  z-index: 1000;
`;

const StyledDropdownMenuHeaderEndComponent = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
`;

export type ObjectSortDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
  hotkeyScope,
}: ObjectSortDropdownButtonProps) => {
  const { toggleSortDropdown } = useToggleSortDropdown();

  const { resetRecordSortDropdownSearchInput } =
    useResetRecordSortDropdownSearchInput();

  const setObjectSortDropdownSearchInput = useSetRecoilComponentStateV2(
    objectSortDropdownSearchInputComponentState,
  );

  const isRecordSortDirectionMenuUnfolded = useRecoilComponentValueV2(
    isRecordSortDirectionDropdownMenuUnfoldedComponentState,
  );

  const { resetSortDropdown } = useResetSortDropdown();

  const { recordIndexId, objectMetadataItem } = useRecordIndexContextOrThrow();

  const objectSortDropdownSearchInput = useRecoilComponentValueV2(
    objectSortDropdownSearchInputComponentState,
  );

  const sortableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForSortFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { getIcon } = useIcons();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );
  const visibleColumnsFieldMetadataIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
  );
  const hiddenTableColumns = useRecoilComponentValueV2(
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

  const handleButtonClick = () => {
    toggleSortDropdown();
  };

  const handleDropdownButtonClose = () => {
    resetRecordSortDropdownSearchInput();
    resetSortDropdown();
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
    useRecoilComponentStateV2(selectedRecordSortDirectionComponentState);

  const setIsRecordSortDirectionMenuUnfolded = useSetRecoilComponentStateV2(
    isRecordSortDirectionDropdownMenuUnfoldedComponentState,
  );

  const handleSortDirectionClick = (sortDirection: RecordSortDirection) => {
    setSelectedRecordSortDirection(sortDirection);
    setIsRecordSortDirectionMenuUnfolded(false);
  };

  const { isDropdownOpen } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  const { t } = useLingui();

  const theme = useTheme();

  const selectableItemIdArray = [
    ...visibleFieldMetadataItems.map((item) => item.id),
    ...hiddenFieldMetadataItems.map((item) => item.id),
  ];

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const setSelectedItemId = useSetRecoilComponentStateV2(
    selectedItemIdComponentState,
    OBJECT_SORT_DROPDOWN_ID,
  );

  const shouldShowHiddenFields = hiddenFieldMetadataItems.length > 0;
  const shouldShowVisibleFields = visibleFieldMetadataItems.length > 0;

  return (
    <Dropdown
      dropdownId={OBJECT_SORT_DROPDOWN_ID}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
      clickableComponent={
        <StyledHeaderDropdownButton
          onClick={() => {
            handleButtonClick();
            setSelectedItemId(selectableItemIdArray[0]);
          }}
          isUnfolded={isDropdownOpen}
        >
          <Trans>Sort</Trans>
        </StyledHeaderDropdownButton>
      }
      dropdownComponents={
        <DropdownContent>
          <SelectableList
            selectableListInstanceId={OBJECT_SORT_DROPDOWN_ID}
            hotkeyScope={hotkeyScope.scope}
            selectableItemIdArray={selectableItemIdArray}
          >
            {isRecordSortDirectionMenuUnfolded && (
              <StyledSelectedSortDirectionContainer>
                <DropdownMenuItemsContainer>
                  {RECORD_SORT_DIRECTIONS.map((sortDirection, index) => (
                    <MenuItem
                      key={index}
                      focused={selectedItemId === sortDirection}
                      onClick={() => handleSortDirectionClick(sortDirection)}
                      text={
                        sortDirection === 'asc' ? t`Ascending` : t`Descending`
                      }
                    />
                  ))}
                </DropdownMenuItemsContainer>
              </StyledSelectedSortDirectionContainer>
            )}
            <DropdownMenuHeader
              onClick={() =>
                setIsRecordSortDirectionMenuUnfolded(
                  !isRecordSortDirectionMenuUnfolded,
                )
              }
              EndComponent={
                <StyledDropdownMenuHeaderEndComponent>
                  <IconChevronDown size={theme.icon.size.md} />
                </StyledDropdownMenuHeaderEndComponent>
              }
            >
              {selectedRecordSortDirection === 'asc'
                ? t`Ascending`
                : t`Descending`}
            </DropdownMenuHeader>
            <StyledInput
              autoFocus
              value={objectSortDropdownSearchInput}
              placeholder={t`Search fields`}
              onChange={(event) =>
                setObjectSortDropdownSearchInput(event.target.value)
              }
            />
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
