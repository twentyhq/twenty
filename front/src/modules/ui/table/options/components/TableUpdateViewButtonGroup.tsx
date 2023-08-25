import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { Button, ButtonSize } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { DropdownMenuContainer } from '@/ui/filter-n-sort/components/DropdownMenuContainer';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { canPersistFiltersScopedState } from '@/ui/filter-n-sort/states/selectors/canPersistFiltersScopedState';
import { canPersistSortsScopedState } from '@/ui/filter-n-sort/states/selectors/canPersistSortsScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import { IconChevronDown, IconPlus } from '@/ui/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
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
  const theme = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedState([tableScopeId, currentViewId]),
  );
  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedState([tableScopeId, currentViewId]),
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

  const handleViewSubmit = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        await Promise.resolve(onViewSubmit?.());

        const selectedFilters = await snapshot.getPromise(
          filtersScopedState(tableScopeId),
        );
        set(savedFiltersScopedState(currentViewId), selectedFilters);

        const selectedSorts = await snapshot.getPromise(
          sortsScopedState(tableScopeId),
        );
        set(savedSortsScopedState(currentViewId), selectedSorts);
      },
    [currentViewId, onViewSubmit, tableScopeId],
  );

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    HotkeyScope,
    [],
  );

  return (
    <StyledContainer>
      <ButtonGroup size={ButtonSize.Small}>
        <Button
          title="Update view"
          disabled={!currentViewId || (!canPersistFilters && !canPersistSorts)}
          onClick={handleViewSubmit}
        />
        <Button
          size={ButtonSize.Small}
          icon={<IconChevronDown />}
          onClick={handleArrowDownButtonClick}
        />
      </ButtonGroup>

      {isDropdownOpen && (
        <StyledDropdownMenuContainer onClose={handleDropdownClose}>
          <StyledDropdownMenuItemsContainer>
            <DropdownMenuItem onClick={handleCreateViewButtonClick}>
              <IconPlus size={theme.icon.size.md} />
              Create view
            </DropdownMenuItem>
          </StyledDropdownMenuItemsContainer>
        </StyledDropdownMenuContainer>
      )}
    </StyledContainer>
  );
};
