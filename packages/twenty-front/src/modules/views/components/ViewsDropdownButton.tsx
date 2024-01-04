import { MouseEvent } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import {
  IconChevronDown,
  IconList,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@/ui/display/icon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useViewBar } from '@/views/hooks/useViewBar';
import { assertNotNull } from '~/utils/assert';

import { ViewsDropdownId } from '../constants/ViewsDropdownId';
import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledDropdownLabelAdornments = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.grayScale.gray35};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledViewIcon = styled(IconList)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledViewName = styled.span`
  display: inline-block;
  max-width: 130px;
  @media (max-width: 375px) {
    max-width: 90px;
  }
  @media (min-width: 376px) and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 110px;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
`;

export type ViewsDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  onViewEditModeChange?: () => void;
  optionsDropdownScopeId: string;
};

export const ViewsDropdownButton = ({
  hotkeyScope,
  onViewEditModeChange,
  optionsDropdownScopeId,
}: ViewsDropdownButtonProps) => {
  const theme = useTheme();
  const { removeView, changeViewInUrl } = useViewBar();

  const { viewsState, currentViewSelector, entityCountInCurrentViewState } =
    useViewScopedStates();

  const views = useRecoilValue(viewsState);
  const currentView = useRecoilValue(currentViewSelector);
  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState,
  );

  const { setViewEditMode, setCurrentViewId, loadView } = useViewBar();

  const {
    isDropdownOpen: isViewsDropdownOpen,
    closeDropdown: closeViewsDropdown,
  } = useDropdown(ViewsDropdownId);

  const { openDropdown: openOptionsDropdown } = useDropdown(
    optionsDropdownScopeId,
  );

  const handleViewSelect = useRecoilCallback(
    () => async (viewId: string) => {
      changeViewInUrl(viewId);
      loadView(viewId);
      closeViewsDropdown();
    },
    [changeViewInUrl, closeViewsDropdown, loadView],
  );

  const handleAddViewButtonClick = () => {
    setViewEditMode('create');
    onViewEditModeChange?.();
    closeViewsDropdown();
    openOptionsDropdown();
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    changeViewInUrl(viewId);
    setCurrentViewId(viewId);
    setViewEditMode('edit');
    onViewEditModeChange?.();
    closeViewsDropdown();
    openOptionsDropdown();
  };

  const handleDeleteViewButtonClick = async (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();

    await removeView(viewId);
    closeViewsDropdown();
  };

  return (
    <DropdownScope dropdownScopeId={ViewsDropdownId}>
      <Dropdown
        dropdownHotkeyScope={hotkeyScope}
        clickableComponent={
          <StyledDropdownButtonContainer isUnfolded={isViewsDropdownOpen}>
            <StyledViewIcon size={theme.icon.size.md} />
            <StyledViewName>{currentView?.name ?? 'All'}</StyledViewName>
            <StyledDropdownLabelAdornments>
              · {entityCountInCurrentView}{' '}
              <IconChevronDown size={theme.icon.size.sm} />
            </StyledDropdownLabelAdornments>
          </StyledDropdownButtonContainer>
        }
        dropdownComponents={
          <>
            <DropdownMenuItemsContainer>
              {views.map((view) => (
                <MenuItem
                  key={view.id}
                  iconButtons={[
                    {
                      Icon: IconPencil,
                      onClick: (event: MouseEvent<HTMLButtonElement>) =>
                        handleEditViewButtonClick(event, view.id),
                    },
                    views.length > 1
                      ? {
                          Icon: IconTrash,
                          onClick: (event: MouseEvent<HTMLButtonElement>) =>
                            handleDeleteViewButtonClick(event, view.id),
                        }
                      : null,
                  ].filter(assertNotNull)}
                  onClick={() => handleViewSelect(view.id)}
                  LeftIcon={IconList}
                  text={view.name}
                />
              ))}
            </DropdownMenuItemsContainer>
            <DropdownMenuSeparator />
            <StyledBoldDropdownMenuItemsContainer>
              <MenuItem
                onClick={handleAddViewButtonClick}
                LeftIcon={IconPlus}
                text="Add view"
              />
            </StyledBoldDropdownMenuItemsContainer>
          </>
        }
      />
    </DropdownScope>
  );
};
