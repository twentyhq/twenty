import { type FormEvent, useCallback, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import {
  IconChevronLeft,
  IconFileImport,
  IconMinus,
  IconPlus,
  IconTag,
} from '@/ui/icon';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

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
import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownSection } from './TableOptionsDropdownSection';

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
  const theme = useTheme();

  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const { closeDropdownButton } = useDropdownButton({ key: 'options' });

  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [viewEditMode, setViewEditMode] = useRecoilState(
    tableViewEditModeState,
  );
  const [columns, setColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const visibleColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const viewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );

  const handleColumnVisibilityChange = useCallback(
    async (columnId: string, nextIsVisible: boolean) => {
      const nextColumns = columns.map((column) =>
        column.id === columnId
          ? { ...column, isVisible: nextIsVisible }
          : column,
      );

      setColumns(nextColumns);
    },
    [columns, setColumns],
  );

  const renderFieldActions = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) =>
      // Do not allow hiding last visible column
      !column.isVisible || visibleColumns.length > 1
        ? [
            <IconButton
              icon={
                column.isVisible ? (
                  <IconMinus size={theme.icon.size.sm} />
                ) : (
                  <IconPlus size={theme.icon.size.sm} />
                )
              }
              onClick={() =>
                handleColumnVisibilityChange(column.id, !column.isVisible)
              }
            />,
          ]
        : undefined,
    [handleColumnVisibilityChange, theme.icon.size.sm, visibleColumns.length],
  );

  const resetViewEditMode = useCallback(() => {
    setViewEditMode({ mode: undefined, viewId: undefined });

    if (viewEditInputRef.current) {
      viewEditInputRef.current.value = '';
    }
  }, [setViewEditMode]);

  const handleViewNameSubmit = useRecoilCallback(
    ({ set, snapshot }) =>
      async (event?: FormEvent) => {
        event?.preventDefault();

        const name = viewEditInputRef.current?.value;

        if (!viewEditMode.mode || !name) {
          return resetViewEditMode();
        }

        const views = await snapshot.getPromise(tableViewsState(tableScopeId));

        if (viewEditMode.mode === 'create') {
          const viewToCreate = { id: v4(), name };
          const nextViews = [...views, viewToCreate];

          const currentColumns = await snapshot.getPromise(
            tableColumnsScopedState(tableScopeId),
          );
          set(
            savedTableColumnsScopedState(viewToCreate.id),
            currentColumns.map((column) => ({ ...column, id: v4() })),
          );

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

        if (viewEditMode.mode === 'edit') {
          const nextViews = views.map((view) =>
            view.id === viewEditMode.viewId ? { ...view, name } : view,
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
      viewEditMode.mode,
      viewEditMode.viewId,
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
          {!!viewEditMode.mode ? (
            <DropdownMenuInput
              ref={viewEditInputRef}
              autoFocus
              placeholder={
                viewEditMode.mode === 'create' ? 'New view' : 'View name'
              }
              defaultValue={
                viewEditMode.viewId
                  ? viewsById[viewEditMode.viewId]?.name
                  : undefined
              }
            />
          ) : (
            <DropdownMenuHeader>View settings</DropdownMenuHeader>
          )}
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <DropdownMenuItem
              onClick={() => handleSelectOption(Option.Properties)}
            >
              <IconTag size={theme.icon.size.md} />
              Properties
            </DropdownMenuItem>
            {onImport && (
              <DropdownMenuItem onClick={onImport}>
                <IconFileImport size={theme.icon.size.md} />
                Import
              </DropdownMenuItem>
            )}
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {selectedOption === Option.Properties && (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={resetSelectedOption}
          >
            Properties
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <TableOptionsDropdownSection
            renderActions={renderFieldActions}
            title="Visible"
            columns={visibleColumns}
          />
          {hiddenColumns.length > 0 && (
            <>
              <StyledDropdownMenuSeparator />
              <TableOptionsDropdownSection
                renderActions={renderFieldActions}
                title="Hidden"
                columns={hiddenColumns}
              />
            </>
          )}
        </>
      )}
    </StyledDropdownMenu>
  );
}
