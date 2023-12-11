import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconChevronDown, IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { UpdateViewDropdownId } from '@/views/constants/UpdateViewDropdownId';
import { useViewBar } from '@/views/hooks/useViewBar';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';

const StyledContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export type UpdateViewButtonGroupProps = {
  hotkeyScope: HotkeyScope;
  onViewEditModeChange?: () => void;
};

export const UpdateViewButtonGroup = ({
  hotkeyScope,
  onViewEditModeChange,
}: UpdateViewButtonGroupProps) => {
  const { updateCurrentView, setViewEditMode } = useViewBar();
  const { canPersistFiltersSelector, canPersistSortsSelector } =
    useViewScopedStates();

  const canPersistFilters = useRecoilValue(canPersistFiltersSelector);
  const canPersistSorts = useRecoilValue(canPersistSortsSelector);

  const canPersistView = canPersistFilters || canPersistSorts;

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode('create');
    onViewEditModeChange?.();
  }, [setViewEditMode, onViewEditModeChange]);

  const handleViewSubmit = async () => {
    await updateCurrentView?.();
  };

  if (!canPersistView) {
    return <></>;
  }

  return (
    <DropdownScope dropdownScopeId={UpdateViewDropdownId}>
      <Dropdown
        dropdownHotkeyScope={hotkeyScope}
        clickableComponent={
          <StyledContainer>
            <ButtonGroup size="small" accent="blue">
              <Button title="Update view" onClick={handleViewSubmit} />
              <Button size="small" Icon={IconChevronDown} />
            </ButtonGroup>
          </StyledContainer>
        }
        dropdownComponents={
          <>
            <DropdownMenuItemsContainer>
              <MenuItem
                onClick={handleCreateViewButtonClick}
                LeftIcon={IconPlus}
                text="Create view"
              />
            </DropdownMenuItemsContainer>
          </>
        }
      />
    </DropdownScope>
  );
};
