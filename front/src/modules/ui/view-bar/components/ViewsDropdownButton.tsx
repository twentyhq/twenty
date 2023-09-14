import { type Context, type MouseEvent } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { StyledDropdownButtonContainer } from '@/ui/dropdown/components/StyledDropdownButtonContainer';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import {
  IconChevronDown,
  IconList,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { currentViewScopedSelector } from '@/ui/view-bar/states/selectors/currentViewScopedSelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';
import { viewsScopedState } from '@/ui/view-bar/states/viewsScopedState';
import type { View } from '@/ui/view-bar/types/View';
import { assertNotNull } from '~/utils/assert';

import { ViewsDropdownId } from '../constants/ViewsDropdownId';

const StyledBoldDropdownMenuItemsContainer = styled(
  StyledDropdownMenuItemsContainer,
)`
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
  max-width: 200px;
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
  defaultViewName: string;
  hotkeyScope: HotkeyScope;
  onViewEditModeChange?: () => void;
  onViewsChange?: (views: View[]) => void | Promise<void>;
  onViewSelect?: (viewId: string) => void | Promise<void>;
  scopeContext: Context<string | null>;
};

export const ViewsDropdownButton = ({
  defaultViewName,
  hotkeyScope,
  onViewEditModeChange,
  onViewsChange,
  onViewSelect,
  scopeContext,
}: ViewsDropdownButtonProps) => {
  const theme = useTheme();

  const { isDropdownButtonOpen, closeDropdownButton, toggleDropdownButton } =
    useDropdownButton({
      dropdownId: ViewsDropdownId,
    });

  const recoilScopeId = useContextScopeId(scopeContext);

  const [, setCurrentViewId] = useRecoilScopedState(
    currentViewIdScopedState,
    scopeContext,
  );
  const currentView = useRecoilScopedValue(
    currentViewScopedSelector,
    scopeContext,
  );
  const [views, setViews] = useRecoilScopedState(
    viewsScopedState,
    scopeContext,
  );

  const setViewEditMode = useSetRecoilState(viewEditModeState);

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        await onViewSelect?.(viewId);

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState(viewId),
        );

        set(filtersScopedState(recoilScopeId), savedFilters);
        set(sortsScopedState(recoilScopeId), savedSorts);
        set(currentViewIdScopedState(recoilScopeId), viewId);
        closeDropdownButton();
      },
    [onViewSelect, recoilScopeId, closeDropdownButton],
  );

  const handleAddViewButtonClick = () => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    onViewEditModeChange?.();
    closeDropdownButton();
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setViewEditMode({ mode: 'edit', viewId });
    onViewEditModeChange?.();
    closeDropdownButton();
  };

  const handleDeleteViewButtonClick = async (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();

    if (currentView?.id === viewId) setCurrentViewId(undefined);

    const nextViews = views.filter((view) => view.id !== viewId);

    setViews(nextViews);
    await onViewsChange?.(nextViews);
    closeDropdownButton();
  };

  const handleViewButtonClick = () => {
    toggleDropdownButton();
  };

  return (
    <DropdownButton
      dropdownId={ViewsDropdownId}
      dropdownHotkeyScope={hotkeyScope}
      buttonComponents={
        <StyledDropdownButtonContainer
          isUnfolded={isDropdownButtonOpen}
          onClick={handleViewButtonClick}
        >
          <StyledViewIcon size={theme.icon.size.md} />
          <StyledViewName>
            {currentView?.name || defaultViewName}
          </StyledViewName>
          <StyledDropdownLabelAdornments>
            · {views.length} <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <StyledDropdownMenu>
          <StyledDropdownMenuItemsContainer>
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
          </StyledDropdownMenuItemsContainer>
          <StyledDropdownMenuSeparator />
          <StyledBoldDropdownMenuItemsContainer>
            <MenuItem
              onClick={handleAddViewButtonClick}
              LeftIcon={IconPlus}
              text="Add view"
            />
          </StyledBoldDropdownMenuItemsContainer>
        </StyledDropdownMenu>
      }
    />
  );
};
