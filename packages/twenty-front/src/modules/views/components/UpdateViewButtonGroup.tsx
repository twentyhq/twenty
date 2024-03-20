import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { IconChevronDown, IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { UPDATE_VIEW_DROPDOWN_ID } from '@/views/constants/UpdateViewDropdownId';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useSaveCurrentViewFiltersAndSorts } from '@/views/hooks/useSaveCurrentViewFiltersAndSorts';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.md};
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
  const { canPersistViewSelector, viewEditModeState } = useViewStates();
  const { saveCurrentViewFilterAndSorts } = useSaveCurrentViewFiltersAndSorts();

  const setViewEditMode = useSetRecoilState(viewEditModeState);
  const canPersistView = useRecoilValue(canPersistViewSelector());

  const handleCreateViewButtonClick = useCallback(() => {
    setViewEditMode('create');
    onViewEditModeChange?.();
  }, [setViewEditMode, onViewEditModeChange]);

  const handleViewSubmit = async () => {
    await saveCurrentViewFilterAndSorts();
  };

  if (!canPersistView) {
    return <></>;
  }

  return (
    <StyledContainer>
      <ButtonGroup size="small" accent="blue">
        <Button title="Update view" onClick={handleViewSubmit} />
        <Dropdown
          dropdownId={UPDATE_VIEW_DROPDOWN_ID}
          dropdownHotkeyScope={hotkeyScope}
          clickableComponent={
            <Button size="small" accent="blue" Icon={IconChevronDown} />
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
      </ButtonGroup>
    </StyledContainer>
  );
};
