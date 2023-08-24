import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import DropdownButton from '@/ui/filter-n-sort/components/DropdownButton';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import {
  IconChevronDown,
  IconList,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@/ui/icon';
import {
  currentTableViewIdState,
  currentTableViewState,
  type TableView,
  tableViewEditModeState,
  tableViewsState,
} from '@/ui/table/states/tableViewsState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { TableViewsHotkeyScope } from '../../types/TableViewsHotkeyScope';

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

type TableViewsDropdownButtonProps = {
  defaultViewName: string;
  HotkeyScope: TableViewsHotkeyScope;
  onViewsChange?: (views: TableView[]) => void;
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

  const currentView = useRecoilScopedValue(
    currentTableViewState,
    TableRecoilScopeContext,
  );
  const views = useRecoilScopedValue(tableViewsState, TableRecoilScopeContext);
  const setViewEditMode = useSetRecoilState(tableViewEditModeState);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId?: string) => {
        const savedFilters = await snapshot.getPromise(
          savedFiltersScopedState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsScopedState(viewId),
        );

        set(filtersScopedState(tableScopeId), savedFilters);
        set(sortsScopedState(tableScopeId), savedSorts);
        set(currentTableViewIdState(tableScopeId), viewId);
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
      setIsUnfolded(false);
    },
    [setViewEditMode],
  );

  const handleDeleteViewButtonClick = useRecoilCallback(
    ({ set }) =>
      async (event: MouseEvent<HTMLButtonElement>, viewId: string) => {
        event.stopPropagation();

        if (currentView?.id === viewId)
          set(currentTableViewIdState(tableScopeId), undefined);

        const nextViews = views.filter((view) => view.id !== viewId);

        set(tableViewsState(tableScopeId), nextViews);
        await Promise.resolve(onViewsChange?.(nextViews));
        setIsUnfolded(false);
      },
    [currentView?.id, onViewsChange, tableScopeId, views],
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
          {currentView?.name || defaultViewName}{' '}
          <StyledDropdownLabelAdornments>
            · {views.length + 1} <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </>
      }
      isActive={false}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={setIsUnfolded}
      anchor="left"
      HotkeyScope={HotkeyScope}
    >
      <StyledDropdownMenuItemsContainer>
        <DropdownMenuItem onClick={() => handleViewSelect(undefined)}>
          <IconList size={theme.icon.size.md} />
          {defaultViewName}
        </DropdownMenuItem>
        {views.map((view) => (
          <DropdownMenuItem
            key={view.id}
            actions={[
              <IconButton
                key="edit"
                onClick={(event) => handleEditViewButtonClick(event, view.id)}
                icon={<IconPencil size={theme.icon.size.sm} />}
              />,
              <IconButton
                key="delete"
                onClick={(event) => handleDeleteViewButtonClick(event, view.id)}
                icon={<IconTrash size={theme.icon.size.sm} />}
              />,
            ]}
            onClick={() => handleViewSelect(view.id)}
          >
            <IconList size={theme.icon.size.md} />
            {view.name}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
      <StyledDropdownMenuSeparator />
      <StyledBoldDropdownMenuItemsContainer>
        <DropdownMenuItem onClick={handleAddViewButtonClick}>
          <IconPlus size={theme.icon.size.md} />
          Add view
        </DropdownMenuItem>
      </StyledBoldDropdownMenuItemsContainer>
    </DropdownButton>
  );
};
