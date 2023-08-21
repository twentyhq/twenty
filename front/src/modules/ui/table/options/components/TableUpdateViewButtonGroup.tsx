import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { Button, ButtonSize } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuContainer } from '@/ui/filter-n-sort/components/DropdownMenuContainer';
import { IconChevronDown, IconPlus } from '@/ui/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
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

  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const setViewEditMode = useSetRecoilState(tableViewEditModeState);

  const handleArrowDownButtonClick = useCallback(() => {
    setIsDropdownOpen((previousIsOpen) => !previousIsOpen);
  }, []);

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    setIsDropdownOpen(false);
  }, [setViewEditMode]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    HotkeyScope,
    [],
  );

  const arrowDownButton = (
    <Button
      size={ButtonSize.Small}
      icon={<IconChevronDown />}
      onClick={handleArrowDownButtonClick}
    />
  );

  return (
    <StyledContainer>
      {currentViewId && onViewSubmit ? (
        <ButtonGroup size={ButtonSize.Small}>
          <Button title="Update view" onClick={onViewSubmit} />
          {arrowDownButton}
        </ButtonGroup>
      ) : (
        arrowDownButton
      )}

      {isDropdownOpen && (
        <StyledDropdownMenuContainer onClose={handleDropdownClose}>
          <DropdownMenuItemsContainer>
            <DropdownMenuItem onClick={handleCreateViewButtonClick}>
              <IconPlus size={theme.icon.size.md} />
              Create view
            </DropdownMenuItem>
          </DropdownMenuItemsContainer>
        </StyledDropdownMenuContainer>
      )}
    </StyledContainer>
  );
};
