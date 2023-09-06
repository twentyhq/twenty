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
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersScopedState } from '@/ui/view-bar/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/view-bar/states/savedSortsScopedState';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';
import { viewsScopedState } from '@/ui/view-bar/states/viewsScopedState';
import type { View } from '@/ui/view-bar/types/View';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '../../states/savedTableColumnsScopedState';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownColumnVisibility } from './TableOptionsDropdownSection';

type TableOptionsDropdownButtonProps = {
  onViewsChange?: (views: View[]) => void;
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

  const [viewEditMode, setViewEditMode] = useRecoilState(viewEditModeState);
  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const viewsById = useRecoilScopedValue(
    viewsByIdScopedSelector,
    TableRecoilScopeContext,
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

        const views = await snapshot.getPromise(viewsScopedState(tableScopeId));

        if (viewEditMode.mode === 'create') {
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

          set(viewsScopedState(tableScopeId), nextViews);
          await Promise.resolve(onViewsChange?.(nextViews));

          set(currentViewIdScopedState(tableScopeId), viewToCreate.id);
        }

        if (viewEditMode.mode === 'edit') {
          const nextViews = views.map((view) =>
            view.id === viewEditMode.viewId ? { ...view, name } : view,
          );

          set(viewsScopedState(tableScopeId), nextViews);
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
