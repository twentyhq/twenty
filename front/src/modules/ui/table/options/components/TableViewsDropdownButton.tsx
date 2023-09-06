import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
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
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { assertNotNull } from '~/utils/assert';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '../../states/savedTableColumnsScopedState';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
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

const StyledViewName = styled.span`
  display: inline-block;
  max-width: 200px;
  min-width: 118px;
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

  const [, setCurrentTableViewId] = useRecoilScopedState(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const currentTableView = useRecoilScopedValue(
    currentTableViewState,
    TableRecoilScopeContext,
  );
  const [tableViews, setTableViews] = useRecoilScopedState(
    tableViewsState,
    TableRecoilScopeContext,
  );
  const setViewEditMode = useSetRecoilState(tableViewEditModeState);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedColumns = await snapshot.getPromise(
          savedTableColumnsScopedState(viewId),
        );
        const savedFilters = await snapshot.getPromise(
          savedFiltersScopedState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsScopedState(viewId),
        );

        set(tableColumnsScopedState(tableScopeId), savedColumns);
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
      openOptionsDropdownButton();
      setIsUnfolded(false);
    },
    [setViewEditMode, openOptionsDropdownButton],
  );

  const handleDeleteViewButtonClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>, viewId: string) => {
      event.stopPropagation();

      if (currentTableView?.id === viewId) setCurrentTableViewId(undefined);

      const nextViews = tableViews.filter((view) => view.id !== viewId);

      setTableViews(nextViews);
      await Promise.resolve(onViewsChange?.(nextViews));
      setIsUnfolded(false);
    },
    [
      currentTableView?.id,
      onViewsChange,
      setCurrentTableViewId,
      setTableViews,
      tableViews,
    ],
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
            {currentTableView?.name || defaultViewName}{' '}
          </StyledViewName>
          <StyledDropdownLabelAdornments>
            · {tableViews.length} <IconChevronDown size={theme.icon.size.sm} />
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
        {tableViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            actions={[
              <FloatingIconButton
                key="edit"
                onClick={(event) => handleEditViewButtonClick(event, view.id)}
                icon={<IconPencil size={theme.icon.size.sm} />}
              />,
              tableViews.length > 1 ? (
                <FloatingIconButton
                  key="delete"
                  onClick={(event) =>
                    handleDeleteViewButtonClick(event, view.id)
                  }
                  icon={<IconTrash size={theme.icon.size.sm} />}
                />
              ) : null,
            ].filter(assertNotNull)}
            onClick={() => handleViewSelect(view.id)}
          >
            <IconList size={theme.icon.size.md} />
            <StyledViewName>{view.name}</StyledViewName>
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
