import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { Button } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronDown, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { DropdownMenuContainer } from '@/ui/view-bar/components/DropdownMenuContainer';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/view-bar/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/view-bar/states/savedSortsScopedState';
import { canPersistFiltersScopedSelector } from '@/ui/view-bar/states/selectors/canPersistFiltersScopedSelector';
import { canPersistSortsScopedSelector } from '@/ui/view-bar/states/selectors/canPersistSortsScopedSelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '../../states/savedTableColumnsScopedState';
import { canPersistTableColumnsScopedSelector } from '../../states/selectors/canPersistTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
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
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );

  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedColumns = useSetRecoilState(
    savedTableColumnsScopedState(currentViewId),
  );
  const canPersistColumns = useRecoilValue(
    canPersistTableColumnsScopedSelector([tableScopeId, currentViewId]),
  );

  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const setSavedFilters = useSetRecoilState(
    savedFiltersScopedState(currentViewId),
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedSelector([tableScopeId, currentViewId]),
  );

  const sorts = useRecoilScopedValue(sortsScopedState, TableRecoilScopeContext);
  const setSavedSorts = useSetRecoilState(savedSortsScopedState(currentViewId));
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedSelector([tableScopeId, currentViewId]),
  );

  const setViewEditMode = useSetRecoilState(viewEditModeState);

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
    if (canPersistColumns) setSavedColumns(tableColumns);
    if (canPersistFilters) setSavedFilters(filters);
    if (canPersistSorts) setSavedSorts(sorts);

    await Promise.resolve(onViewSubmit?.());
  }, [
    canPersistColumns,
    canPersistFilters,
    canPersistSorts,
    filters,
    onViewSubmit,
    setSavedColumns,
    setSavedFilters,
    setSavedSorts,
    sorts,
    tableColumns,
  ]);

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    HotkeyScope,
    [],
  );

  return (
    <StyledContainer>
      <ButtonGroup size="small" accent="blue">
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
        <DropdownMenuContainer onClose={handleDropdownClose}>
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={handleCreateViewButtonClick}
              LeftIcon={IconPlus}
              text="Create view"
            />
          </StyledDropdownMenuItemsContainer>
        </DropdownMenuContainer>
      )}
    </StyledContainer>
  );
};
