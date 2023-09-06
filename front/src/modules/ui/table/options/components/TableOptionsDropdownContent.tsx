import { type FormEvent, useCallback, useRef, useState } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/view-bar/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/view-bar/states/savedSortsScopedState';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '../../states/savedTableColumnsScopedState';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import {
  currentTableViewIdState,
  type TableView,
  tableViewEditModeState,
  tableViewsByIdState,
  tableViewsState,
} from '../../states/tableViewsState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownColumnVisibility } from './TableOptionsDropdownSection';

type TableOptionsDropdownButtonProps = {
  onViewsChange?: (views: TableView[]) => void;
  onImport?: () => void;
};

enum Option {
  Properties = 'Properties',
}

export function TableOptionsDropdownContent({
  onViewsChange,
  onImport,
}: TableOptionsDropdownButtonProps) {
  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const { closeDropdownButton } = useDropdownButton({ key: 'options' });

  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [tableViewEditMode, setTableViewEditMode] = useRecoilState(
    tableViewEditModeState,
  );
  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const tableViewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );

  const resetViewEditMode = useCallback(() => {
    setTableViewEditMode({ mode: undefined, viewId: undefined });

    if (viewEditInputRef.current) {
      viewEditInputRef.current.value = '';
    }
  }, [setTableViewEditMode]);

  const handleViewNameSubmit = useRecoilCallback(
    ({ set, snapshot }) =>
      async (event?: FormEvent) => {
        event?.preventDefault();

        const name = viewEditInputRef.current?.value;

        if (!tableViewEditMode.mode || !name) {
          return resetViewEditMode();
        }

        const views = await snapshot.getPromise(tableViewsState(tableScopeId));

        if (tableViewEditMode.mode === 'create') {
          const viewToCreate = { id: v4(), name };
          const nextViews = [...views, viewToCreate];

          const currentColumns = await snapshot.getPromise(
            tableColumnsScopedState(tableScopeId),
          );
          set(savedTableColumnsScopedState(viewToCreate.id), currentColumns);

          const selectedFilters = await snapshot.getPromise(
            filtersScopedState(tableScopeId),
          );
          set(savedFiltersScopedState(viewToCreate.id), selectedFilters);

          const selectedSorts = await snapshot.getPromise(
            sortsScopedState(tableScopeId),
          );
          set(savedSortsScopedState(viewToCreate.id), selectedSorts);

          set(tableViewsState(tableScopeId), nextViews);
          await Promise.resolve(onViewsChange?.(nextViews));

          set(currentTableViewIdState(tableScopeId), viewToCreate.id);
        }

        if (tableViewEditMode.mode === 'edit') {
          const nextViews = views.map((view) =>
            view.id === tableViewEditMode.viewId ? { ...view, name } : view,
          );

          set(tableViewsState(tableScopeId), nextViews);
          await Promise.resolve(onViewsChange?.(nextViews));
        }

        return resetViewEditMode();
      },
    [
      onViewsChange,
      resetViewEditMode,
      tableScopeId,
      tableViewEditMode.mode,
      tableViewEditMode.viewId,
    ],
  );

  const handleSelectOption = useCallback(
    (option: Option) => {
      handleViewNameSubmit();
      setSelectedOption(option);
    },
    [handleViewNameSubmit],
  );

  const resetSelectedOption = useCallback(() => {
    setSelectedOption(undefined);
  }, []);

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleViewNameSubmit();
      resetSelectedOption();
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  return (
    <StyledDropdownMenu>
      {!selectedOption && (
        <>
          {!!tableViewEditMode.mode ? (
            <DropdownMenuInput
              ref={viewEditInputRef}
              autoFocus
              placeholder={
                tableViewEditMode.mode === 'create' ? 'New view' : 'View name'
              }
              defaultValue={
                tableViewEditMode.viewId
                  ? tableViewsById[tableViewEditMode.viewId]?.name
                  : undefined
              }
            />
          ) : (
            <DropdownMenuHeader>View settings</DropdownMenuHeader>
          )}
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={() => handleSelectOption(Option.Properties)}
              LeftIcon={IconTag}
              text="Properties"
            />
            {onImport && (
              <MenuItem
                onClick={onImport}
                LeftIcon={IconFileImport}
                text="Import"
              />
            )}
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {selectedOption === Option.Properties && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={resetSelectedOption}
          >
            Properties
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <TableOptionsDropdownColumnVisibility
            title="Visible"
            columns={visibleTableColumns}
          />
          {hiddenTableColumns.length > 0 && (
            <>
              <StyledDropdownMenuSeparator />
              <TableOptionsDropdownColumnVisibility
                title="Hidden"
                columns={hiddenTableColumns}
              />
            </>
          )}
        </>
      )}
    </StyledDropdownMenu>
  );
}
