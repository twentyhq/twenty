import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

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
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import DropdownButton from '@/ui/view-bar/components/DropdownButton';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { currentViewScopedSelector } from '@/ui/view-bar/states/selectors/currentViewScopedSelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';
import { viewsScopedState } from '@/ui/view-bar/states/viewsScopedState';
import type { View } from '@/ui/view-bar/types/View';
import { ViewsHotkeyScope } from '@/ui/view-bar/types/ViewsHotkeyScope';
import { assertNotNull } from '~/utils/assert';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';

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

type TableViewsDropdownButtonProps = {
  defaultViewName: string;
  HotkeyScope: ViewsHotkeyScope;
  onViewsChange?: (views: View[]) => void;
};

export const TableViewsDropdownButton = ({
  defaultViewName,
  HotkeyScope,
  onViewsChange,
}: TableViewsDropdownButtonProps) => {
  const theme = useTheme();
  const [isUnfolded, setIsUnfolded] = useState(false);

  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const { openDropdownButton: openOptionsDropdownButton } = useDropdownButton({
    key: 'options',
  });

  const [, setCurrentViewId] = useRecoilScopedState(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const currentView = useRecoilScopedValue(
    currentViewScopedSelector,
    TableRecoilScopeContext,
  );
  const [views, setViews] = useRecoilScopedState(
    viewsScopedState,
    TableRecoilScopeContext,
  );
  const setViewEditMode = useSetRecoilState(viewEditModeState);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedColumns = await snapshot.getPromise(
          savedTableColumnsFamilyState(viewId),
        );
        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState(viewId),
        );

        set(tableColumnsScopedState(tableScopeId), savedColumns);
        set(filtersScopedState(tableScopeId), savedFilters);
        set(sortsScopedState(tableScopeId), savedSorts);
        set(currentViewIdScopedState(tableScopeId), viewId);
        setIsUnfolded(false);
      },
    [tableScopeId],
  );

  const handleAddViewButtonClick = useCallback(() => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    openOptionsDropdownButton();
    setIsUnfolded(false);
  }, [setViewEditMode, openOptionsDropdownButton]);

  const handleEditViewButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, viewId: string) => {
      event.stopPropagation();
      setViewEditMode({ mode: 'edit', viewId });
      openOptionsDropdownButton();
      setIsUnfolded(false);
    },
    [setViewEditMode, openOptionsDropdownButton],
  );

  const handleDeleteViewButtonClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>, viewId: string) => {
      event.stopPropagation();

      if (currentView?.id === viewId) setCurrentViewId(undefined);

      const nextViews = views.filter((view) => view.id !== viewId);

      setViews(nextViews);
      await Promise.resolve(onViewsChange?.(nextViews));
      setIsUnfolded(false);
    },
    [currentView?.id, onViewsChange, setCurrentViewId, setViews, views],
  );

  useEffect(() => {
    isUnfolded
      ? setHotkeyScopeAndMemorizePreviousScope(HotkeyScope)
      : goBackToPreviousHotkeyScope();
  }, [
    HotkeyScope,
    goBackToPreviousHotkeyScope,
    isUnfolded,
    setHotkeyScopeAndMemorizePreviousScope,
  ]);

  return (
    <DropdownButton
      label={
        <>
          <StyledViewIcon size={theme.icon.size.md} />
          <StyledViewName>
            {currentView?.name || defaultViewName}
          </StyledViewName>
          <StyledDropdownLabelAdornments>
            · {views.length} <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </>
      }
      isActive={false}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={setIsUnfolded}
      anchor="left"
      HotkeyScope={HotkeyScope}
      menuWidth="auto"
    >
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
    </DropdownButton>
  );
};
