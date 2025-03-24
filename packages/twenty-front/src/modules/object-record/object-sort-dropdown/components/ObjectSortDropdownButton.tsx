import styled from '@emotion/styled';
import { IconChevronDown, MenuItem, useIcons } from 'twenty-ui';

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
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';
import { useTheme } from '@emotion/react';

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
          <Trans>Sort</Trans>
        </StyledHeaderDropdownButton>
      }
      dropdownComponents={
        <>
          {isRecordSortDirectionMenuUnfolded && (
            <StyledSelectedSortDirectionContainer>
              <DropdownMenuItemsContainer>
                {RECORD_SORT_DIRECTIONS.map((sortDirection, index) => (
                  <MenuItem
                    key={index}
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
            EndComponent={<IconChevronDown size={theme.icon.size.md} />}
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
          <DropdownMenuItemsContainer scrollable={false}>
            {visibleFieldMetadataItems.map(
              (visibleFieldMetadataItem, index) => (
                <MenuItem
                  testId={`visible-select-sort-${index}`}
                  key={index}
                  onClick={() => handleAddSort(visibleFieldMetadataItem)}
                  LeftIcon={getIcon(visibleFieldMetadataItem.icon)}
                  text={visibleFieldMetadataItem.label}
                />
              ),
            )}
            {shouldShowSeparator && <DropdownMenuSeparator />}
            {hiddenFieldMetadataItems.map((hiddenFieldMetadataItem, index) => (
              <MenuItem
                testId={`hidden-select-sort-${index}`}
                key={index}
                onClick={() => handleAddSort(hiddenFieldMetadataItem)}
                LeftIcon={getIcon(hiddenFieldMetadataItem.icon)}
                text={hiddenFieldMetadataItem.label}
              />
            ))}
          </DropdownMenuItemsContainer>
        </>
      }
      onClose={handleDropdownButtonClose}
    />
  );
};
