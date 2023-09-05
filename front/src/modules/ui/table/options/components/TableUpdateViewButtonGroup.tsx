import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { Button } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { DropdownMenuContainer } from '@/ui/filter-n-sort/components/DropdownMenuContainer';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { canPersistFiltersScopedSelector } from '@/ui/filter-n-sort/states/selectors/canPersistFiltersScopedSelector';
import { canPersistSortsScopedSelector } from '@/ui/filter-n-sort/states/selectors/canPersistSortsScopedSelector';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import { IconChevronDown, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '../../states/savedTableColumnsScopedState';
import { canPersistTableColumnsScopedSelector } from '../../states/selectors/canPersistTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import {
  currentTableViewIdState,
  tableViewEditModeState,
} from '../../states/tableViewsState';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledDropdownMenuContainer = styled(DropdownMenuContainer)`
  z-index: 1;
`;

type TableUpdateViewButtonGroupProps = {
  onViewSubmit?: () => void;
  HotkeyScope: string;
};

export const TableUpdateViewButtonGroup = ({
  onViewSubmit,
  HotkeyScope,
}: TableUpdateViewButtonGroupProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );

  const currentColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedColumns = useSetRecoilState(
    savedTableColumnsScopedState(currentViewId),
  );
  const canPersistColumns = useRecoilValue(
    canPersistTableColumnsScopedSelector([tableScopeId, currentViewId]),
  );

  const selectedFilters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const setSavedFilters = useSetRecoilState(
    savedFiltersScopedState(currentViewId),
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedSelector([tableScopeId, currentViewId]),
  );

  const selectedSorts = useRecoilScopedValue(
    sortsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedSorts = useSetRecoilState(savedSortsScopedState(currentViewId));
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedSelector([tableScopeId, currentViewId]),
  );

  const setViewEditMode = useSetRecoilState(tableViewEditModeState);

  const { openDropdownButton: openOptionsDropdownButton } = useDropdownButton({
    key: 'options',
  });

  const handleArrowDownButtonClick = useCallback(() => {
    setIsDropdownOpen((previousIsOpen) => !previousIsOpen);
  }, []);

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    openOptionsDropdownButton();
    setIsDropdownOpen(false);
  }, [setViewEditMode, openOptionsDropdownButton]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleViewSubmit = useCallback(async () => {
    if (canPersistColumns) setSavedColumns(currentColumns);
    if (canPersistFilters) setSavedFilters(selectedFilters);
    if (canPersistSorts) setSavedSorts(selectedSorts);

    await Promise.resolve(onViewSubmit?.());
  }, [
    canPersistColumns,
    canPersistFilters,
    canPersistSorts,
    currentColumns,
    onViewSubmit,
    selectedFilters,
    selectedSorts,
    setSavedColumns,
    setSavedFilters,
    setSavedSorts,
  ]);

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    HotkeyScope,
    [],
  );

  return (
    <StyledContainer>
      <ButtonGroup size="small">
        <Button
          title="Update view"
          disabled={
            !currentViewId ||
            (!canPersistColumns && !canPersistFilters && !canPersistSorts)
          }
          onClick={handleViewSubmit}
        />
        <Button
          size="small"
          icon={<IconChevronDown />}
          onClick={handleArrowDownButtonClick}
        />
      </ButtonGroup>

      {isDropdownOpen && (
        <StyledDropdownMenuContainer onClose={handleDropdownClose}>
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={handleCreateViewButtonClick}
              LeftIcon={IconPlus}
              text="Create view"
            />
          </StyledDropdownMenuItemsContainer>
        </StyledDropdownMenuContainer>
      )}
    </StyledContainer>
  );
};
