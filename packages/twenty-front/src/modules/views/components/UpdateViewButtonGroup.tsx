import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconChevronDown, IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { UpdateViewDropdownId } from '@/views/constants/UpdateViewDropdownId';
import { useViewBar } from '@/views/hooks/useViewBar';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import useI18n from '@/ui/i18n/useI18n';

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
  const { translate } = useI18n('translations');
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
    <StyledContainer>
      <ButtonGroup size="small" accent="blue">
        <Button title={translate('updateView')} onClick={handleViewSubmit} />
        <Dropdown
          dropdownId={UpdateViewDropdownId}
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
                  text={translate('createView')}
                />
              </DropdownMenuItemsContainer>
            </>
          }
        />
      </ButtonGroup>
    </StyledContainer>
  );
};
