import { useContext, useRef, useState } from 'react';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
} from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { BoardContext } from '@/companies/states/contexts/BoardContext';
import { ViewFieldsVisibilityDropdownSection } from '@/ui/data/view-bar/components/ViewFieldsVisibilityDropdownSection';
import { useUpsertView } from '@/ui/data/view-bar/hooks/useUpsertView';
import { currentViewScopedSelector } from '@/ui/data/view-bar/states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '@/ui/data/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/data/view-bar/states/viewEditModeState';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutKanban,
  IconPlus,
  IconTag,
} from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemNavigate } from '@/ui/navigation/menu-item/components/MenuItemNavigate';
import { MenuItemToggle } from '@/ui/navigation/menu-item/components/MenuItemToggle';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { useBoardCardFields } from '../hooks/useBoardCardFields';
import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';
import { boardColumnsState } from '../states/boardColumnsState';
import { isCompactViewEnabledState } from '../states/isCompactViewEnabledState';
import { savedBoardCardFieldsFamilyState } from '../states/savedBoardCardFieldsFamilyState';
import { hiddenBoardCardFieldsScopedSelector } from '../states/selectors/hiddenBoardCardFieldsScopedSelector';
import { visibleBoardCardFieldsScopedSelector } from '../states/selectors/visibleBoardCardFieldsScopedSelector';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export type BoardOptionsDropdownContentProps = {
  customHotkeyScope: HotkeyScope;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
};

type BoardOptionsMenu = 'fields' | 'stage-creation' | 'stages';

type ColumnForCreate = {
  id: string;
  colorCode: ThemeColor;
  index: number;
  title: string;
};

export const BoardOptionsDropdownContent = ({
  customHotkeyScope,
  onStageAdd,
}: BoardOptionsDropdownContentProps) => {
  const { BoardRecoilScopeContext } = useContext(BoardContext);

  const boardRecoilScopeId = useRecoilScopeId(BoardRecoilScopeContext);

  const stageInputRef = useRef<HTMLInputElement>(null);
  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [currentMenu, setCurrentMenu] = useState<
    BoardOptionsMenu | undefined
  >();

  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);
  const [isCompactViewEnabled, setIsCompactViewEnabled] = useRecoilState(
    isCompactViewEnabledState,
  );

  const hiddenBoardCardFields = useRecoilScopedValue(
    hiddenBoardCardFieldsScopedSelector,
    BoardRecoilScopeContext,
  );
  const hasHiddenFields = hiddenBoardCardFields.length > 0;
  const visibleBoardCardFields = useRecoilScopedValue(
    visibleBoardCardFieldsScopedSelector,
    BoardRecoilScopeContext,
  );
  const hasVisibleFields = visibleBoardCardFields.length > 0;

  const viewsById = useRecoilScopedValue(
    viewsByIdScopedSelector,
    BoardRecoilScopeContext, // TODO: replace with ViewBarRecoilScopeContext
  );
  const currentView = useRecoilScopedValue(
    currentViewScopedSelector,
    BoardRecoilScopeContext,
  );
  const viewEditMode = useRecoilValue(viewEditModeState);
  const resetViewEditMode = useResetRecoilState(viewEditModeState);

  const handleStageSubmit = () => {
    if (currentMenu !== 'stage-creation' || !stageInputRef?.current?.value)
      return;

    const columnToCreate: ColumnForCreate = {
      id: v4(),
      colorCode: 'gray',
      index: boardColumns.length,
      title: stageInputRef.current.value,
    };

    setBoardColumns((previousBoardColumns) => [
      ...previousBoardColumns,
      columnToCreate,
    ]);
    onStageAdd?.(columnToCreate);
  };

  const { upsertView } = useUpsertView();

  const handleViewNameSubmit = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const boardCardFields = await snapshot.getPromise(
          boardCardFieldsScopedState(boardRecoilScopeId),
        );
        const isCreateMode = viewEditMode.mode === 'create';
        const name = viewEditInputRef.current?.value;
        const view = await upsertView(name);

        if (view && isCreateMode) {
          set(savedBoardCardFieldsFamilyState(view.id), boardCardFields);
        }
      },
    [boardRecoilScopeId, upsertView, viewEditMode.mode],
  );

  const resetMenu = () => setCurrentMenu(undefined);

  const handleMenuNavigate = (menu: BoardOptionsMenu) => {
    handleViewNameSubmit();
    setCurrentMenu(menu);
  };

  const { handleFieldVisibilityChange } = useBoardCardFields();

  const { closeDropdown } = useDropdown();

  useScopedHotkeys(
    Key.Escape,
    () => {
      resetViewEditMode();
      closeDropdown();
    },
    customHotkeyScope.scope,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleStageSubmit();
      handleViewNameSubmit();
      resetViewEditMode();
      closeDropdown();
    },
    customHotkeyScope.scope,
  );

  return (
    <>
      {!currentMenu && (
        <>
          <DropdownMenuInput
            ref={viewEditInputRef}
            autoFocus={viewEditMode.mode === 'create' || !!viewEditMode.viewId}
            placeholder={
              viewEditMode.mode === 'create' ? 'New view' : 'View name'
            }
            defaultValue={
              viewEditMode.mode === 'create'
                ? ''
                : viewEditMode.viewId
                ? viewsById[viewEditMode.viewId]?.name
                : currentView?.name
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => handleMenuNavigate('fields')}
              LeftIcon={IconTag}
              text="Fields"
            />
            <MenuItemNavigate
              onClick={() => handleMenuNavigate('stages')}
              LeftIcon={IconLayoutKanban}
              text="Stages"
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconBaselineDensitySmall}
              onToggleChange={setIsCompactViewEnabled}
              toggled={isCompactViewEnabled}
              text="Compact view"
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'stages' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Stages
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setCurrentMenu('stage-creation')}
              LeftIcon={IconPlus}
              text="Add stage"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'stage-creation' && (
        <DropdownMenuSearchInput
          autoFocus
          placeholder="New stage"
          ref={stageInputRef}
        />
      )}
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Fields
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          {hasVisibleFields && (
            <ViewFieldsVisibilityDropdownSection
              title="Visible"
              fields={visibleBoardCardFields}
              onVisibilityChange={handleFieldVisibilityChange}
              isDraggable={true}
            />
          )}
          {hasVisibleFields && hasHiddenFields && <DropdownMenuSeparator />}
          {hasHiddenFields && (
            <ViewFieldsVisibilityDropdownSection
              title="Hidden"
              fields={hiddenBoardCardFields}
              onVisibilityChange={handleFieldVisibilityChange}
              isDraggable={false}
            />
          )}
        </>
      )}
    </>
  );
};
