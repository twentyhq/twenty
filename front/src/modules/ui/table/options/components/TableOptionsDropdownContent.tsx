import { type FormEvent, useCallback, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilState, useRecoilValue } from 'recoil';
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
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import {
  IconChevronLeft,
  IconFileImport,
  IconMinus,
  IconPlus,
  IconTag,
} from '@/ui/icon';
import {
  hiddenTableColumnsState,
  tableColumnsState,
  visibleTableColumnsState,
} from '@/ui/table/states/tableColumnsState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import {
  type TableView,
  tableViewEditModeState,
  tableViewsByIdState,
  tableViewsState,
} from '../../states/tableViewsState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownSection } from './TableOptionsDropdownSection';

type TableOptionsDropdownButtonProps = {
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
  onViewsChange?: (views: TableView[]) => void;
  onImport?: () => void;
};

enum Option {
  Properties = 'Properties',
}

export function TableOptionsDropdownContent({
  onColumnsChange,
  onViewsChange,
  onImport,
}: TableOptionsDropdownButtonProps) {
  const theme = useTheme();

  const { closeDropdownButton } = useDropdownButton({ key: 'options' });

  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [columns, setColumns] = useRecoilState(tableColumnsState);
  const [viewEditMode, setViewEditMode] = useRecoilState(
    tableViewEditModeState,
  );
  const [views, setViews] = useRecoilScopedState(
    tableViewsState,
    TableRecoilScopeContext,
  );
  const visibleColumns = useRecoilValue(visibleTableColumnsState);
  const hiddenColumns = useRecoilValue(hiddenTableColumnsState);
  const viewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, nextIsVisible: boolean) => {
      const nextColumns = columns.map((column) =>
        column.id === columnId
          ? { ...column, isVisible: nextIsVisible }
          : column,
      );

      (onColumnsChange ?? setColumns)(nextColumns);
    },
    [columns, onColumnsChange, setColumns],
  );

  const renderFieldActions = useCallback(
    (column: ViewFieldDefinition<ViewFieldMetadata>) =>
      // Do not allow hiding last visible column
      !column.isVisible || visibleColumns.length > 1 ? (
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
        />
      ) : undefined,
    [handleColumnVisibilityChange, theme.icon.size.sm, visibleColumns.length],
  );

  const resetViewEditMode = useCallback(() => {
    setViewEditMode({ mode: undefined, viewId: undefined });

    if (viewEditInputRef.current) {
      viewEditInputRef.current.value = '';
    }
  }, [setViewEditMode]);

  const handleViewNameSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();

      if (viewEditMode.mode && viewEditInputRef.current?.value) {
        const name = viewEditInputRef.current.value;
        const nextViews =
          viewEditMode.mode === 'create'
            ? [...views, { id: v4(), name }]
            : views.map((view) =>
                view.id === viewEditMode.viewId ? { ...view, name } : view,
              );

        (onViewsChange ?? setViews)(nextViews);
      }

      resetViewEditMode();
    },
    [
      onViewsChange,
      resetViewEditMode,
      setViews,
      viewEditMode.mode,
      viewEditMode.viewId,
      views,
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
