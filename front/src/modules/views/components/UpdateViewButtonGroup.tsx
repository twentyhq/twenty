import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { IconChevronDown, IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useView } from '@/views/hooks/useView';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export type UpdateViewButtonGroupProps = {
  hotkeyScope: string;
  onViewEditModeChange?: () => void;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
  onViewEditModeChange,
}: UpdateViewButtonGroupProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { updateCurrentView, setViewEditMode } = useView();
  const { canPersistFiltersSelector, canPersistSortsSelector } =
    useViewScopedStates();

  const canPersistFilters = useRecoilValue(canPersistFiltersSelector);
  const canPersistSorts = useRecoilValue(canPersistSortsSelector);

  const canPersistView = canPersistFilters || canPersistSorts;

  const handleArrowDownButtonClick = useCallback(() => {
    setIsDropdownOpen((previousIsOpen) => !previousIsOpen);
  }, []);

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode('create');
    onViewEditModeChange?.();
    setIsDropdownOpen(false);
  }, [setViewEditMode, onViewEditModeChange]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleViewSubmit = async () => {
    await updateCurrentView?.();
  };

  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    handleDropdownClose,
    hotkeyScope,
    [],
  );

  if (!canPersistView) return null;

  return (
    <StyledContainer>
      <ButtonGroup size="small" accent="blue">
        <Button title="Update view" onClick={handleViewSubmit} />
        <Button
          size="small"
          Icon={IconChevronDown}
          onClick={handleArrowDownButtonClick}
        />
      </ButtonGroup>

      {isDropdownOpen && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={handleCreateViewButtonClick}
            LeftIcon={IconPlus}
            text="Create view"
          />
        </DropdownMenuItemsContainer>
      )}
    </StyledContainer>
  );
};
