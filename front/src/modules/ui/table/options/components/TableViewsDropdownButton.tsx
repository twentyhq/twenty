import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import DropdownButton from '@/ui/filter-n-sort/components/DropdownButton';
import { IconChevronDown, IconList, IconPencil, IconPlus } from '@/ui/icon';
import {
  currentTableViewIdState,
  currentTableViewState,
  tableViewEditModeState,
  tableViewsState,
} from '@/ui/table/states/tableViewsState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { TableViewsHotkeyScope } from '../../types/TableViewsHotkeyScope';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
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
};

export const TableViewsDropdownButton = ({
  defaultViewName,
  HotkeyScope,
}: TableViewsDropdownButtonProps) => {
  const theme = useTheme();
  const [isUnfolded, setIsUnfolded] = useState(false);

  const currentView = useRecoilScopedValue(
    currentTableViewState,
    TableRecoilScopeContext,
  );
  const views = useRecoilScopedValue(tableViewsState, TableRecoilScopeContext);
  const [, setCurrentViewId] = useRecoilScopedState(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const setViewEditMode = useSetRecoilState(tableViewEditModeState);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleViewSelect = useCallback(
    (viewId?: string) => {
      setCurrentViewId(viewId);
      setIsUnfolded(false);
    },
    [setCurrentViewId],
  );

  const handleAddViewButtonClick = useCallback(() => {
    setViewEditMode({ mode: 'create', viewId: undefined });
    setIsUnfolded(false);
  }, [setViewEditMode]);

  const handleEditViewButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, viewId: string) => {
      event.stopPropagation();
      setViewEditMode({ mode: 'edit', viewId });
      setIsUnfolded(false);
    },
    [setViewEditMode],
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
            actions={
              <IconButton
                onClick={(event) => handleEditViewButtonClick(event, view.id)}
                icon={<IconPencil size={theme.icon.size.sm} />}
              />
            }
            onClick={() => handleViewSelect(view.id)}
          >
            <IconList size={theme.icon.size.md} />
            {view.name}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <StyledDropdownMenuItemsContainer>
        <DropdownMenuItem onClick={handleAddViewButtonClick}>
          <IconPlus size={theme.icon.size.md} />
          Add view
        </DropdownMenuItem>
      </StyledDropdownMenuItemsContainer>
    </DropdownButton>
  );
};
