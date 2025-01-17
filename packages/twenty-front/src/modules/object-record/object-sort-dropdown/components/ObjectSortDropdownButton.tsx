import styled from '@emotion/styled';
import { IconChevronDown, MenuItem, useIcons } from 'twenty-ui';

import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';
import { useCloseSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useCloseSortDropdown';
import { useResetRecordSortDropdownSearchInput } from '@/object-record/object-sort-dropdown/hooks/useResetRecordSortDropdownSearchInput';
import { useResetSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useResetSortDropdown';
import { useToggleSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useToggleSortDropdown';
import { isSortDirectionMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isSortDirectionMenuUnfoldedState';
import { objectSortDropdownSearchInputComponentState } from '@/object-record/object-sort-dropdown/states/objectSortDropdownSearchInputComponentState';
import { onSortSelectComponentState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { selectedSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedSortDirectionState';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { SORT_DIRECTIONS, SortDirection } from '../types/SortDirection';

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

  const isSortDirectionMenuUnfolded = useRecoilComponentValueV2(
    isSortDirectionMenuUnfoldedComponentState,
  );

  const { resetSortDropdown } = useResetSortDropdown();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const objectSortDropdownSearchInput = useRecoilComponentValueV2(
    objectSortDropdownSearchInputComponentState,
  );

  const availableSortDefinitions = useRecoilComponentValueV2(
    availableSortDefinitionsComponentState,
  );

  const { getIcon } = useIcons();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );
  const visibleColumnsIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
  );
  const hiddenTableColumns = useRecoilComponentValueV2(
    hiddenTableColumnsComponentSelector,
    recordIndexId,
  );
  const hiddenColumnIds = hiddenTableColumns.map(
    (column) => column.fieldMetadataId,
  );

  const filteredSearchInputSortDefinitions = availableSortDefinitions.filter(
    (item) =>
      item.label
        .toLocaleLowerCase()
        .includes(objectSortDropdownSearchInput.toLocaleLowerCase()),
  );

  const visibleColumnsSortDefinitions = filteredSearchInputSortDefinitions
    .sort((a, b) => {
      return (
        visibleColumnsIds.indexOf(a.fieldMetadataId) -
        visibleColumnsIds.indexOf(b.fieldMetadataId)
      );
    })
    .filter((item) => visibleColumnsIds.includes(item.fieldMetadataId));

  const hiddenColumnsSortDefinitions = filteredSearchInputSortDefinitions
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((item) => hiddenColumnIds.includes(item.fieldMetadataId));

  const shoudShowSeparator =
    visibleColumnsSortDefinitions.length > 0 &&
    hiddenColumnsSortDefinitions.length > 0;

  const handleButtonClick = () => {
    toggleSortDropdown();
  };

  const handleDropdownButtonClose = () => {
    resetRecordSortDropdownSearchInput();
    resetSortDropdown();
  };

  const { closeSortDropdown } = useCloseSortDropdown();

  const onSortSelect = useRecoilComponentValueV2(onSortSelectComponentState);

  const handleAddSort = (sortDefinition: SortDefinition) => {
    setObjectSortDropdownSearchInput('');
    closeSortDropdown();
    onSortSelect?.({
      fieldMetadataId: sortDefinition.fieldMetadataId,
      direction: selectedSortDirection,
      definition: sortDefinition,
    });
  };

  const [selectedSortDirection, setSelectedSortDirection] =
    useRecoilComponentStateV2(selectedSortDirectionComponentState);

  const setIsSortDirectionMenuUnfolded = useSetRecoilComponentStateV2(
    isSortDirectionMenuUnfoldedComponentState,
  );

  const handleSortDirectionClick = (sortDirection: SortDirection) => {
    setSelectedSortDirection(sortDirection);
    setIsSortDirectionMenuUnfolded(false);
  };

  const { isDropdownOpen } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  return (
    <Dropdown
      dropdownId={OBJECT_SORT_DROPDOWN_ID}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
      clickableComponent={
        <StyledHeaderDropdownButton
          onClick={handleButtonClick}
          isUnfolded={isDropdownOpen}
        >
          Sort
        </StyledHeaderDropdownButton>
      }
      dropdownComponents={
        <>
          {isSortDirectionMenuUnfolded && (
            <StyledSelectedSortDirectionContainer>
              <DropdownMenuItemsContainer>
                {SORT_DIRECTIONS.map((sortDirection, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleSortDirectionClick(sortDirection)}
                    text={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </StyledSelectedSortDirectionContainer>
          )}
          <DropdownMenuHeader
            EndIcon={IconChevronDown}
            onClick={() =>
              setIsSortDirectionMenuUnfolded(!isSortDirectionMenuUnfolded)
            }
          >
            {selectedSortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </DropdownMenuHeader>
          <StyledInput
            autoFocus
            value={objectSortDropdownSearchInput}
            placeholder="Search fields"
            onChange={(event) =>
              setObjectSortDropdownSearchInput(event.target.value)
            }
          />
          <DropdownMenuItemsContainer>
            {visibleColumnsSortDefinitions.map(
              (visibleSortDefinition, index) => (
                <MenuItem
                  testId={`visible-select-sort-${index}`}
                  key={index}
                  onClick={() => handleAddSort(visibleSortDefinition)}
                  LeftIcon={getIcon(visibleSortDefinition.iconName)}
                  text={visibleSortDefinition.label}
                />
              ),
            )}
            {shoudShowSeparator && <DropdownMenuSeparator />}
            {hiddenColumnsSortDefinitions.map((hiddenSortDefinition, index) => (
              <MenuItem
                testId={`hidden-select-sort-${index}`}
                key={index}
                onClick={() => handleAddSort(hiddenSortDefinition)}
                LeftIcon={getIcon(hiddenSortDefinition.iconName)}
                text={hiddenSortDefinition.label}
              />
            ))}
          </DropdownMenuItemsContainer>
        </>
      }
      onClose={handleDropdownButtonClose}
    />
  );
};
