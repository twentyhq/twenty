import { useCallback, useContext, useRef, useState } from 'react';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
} from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { BoardContext } from '@/companies/states/contexts/BoardContext';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { DropdownMenuInputContainer } from '@/ui/dropdown/components/DropdownMenuInputContainer';
import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import {
  IconChevronLeft,
  IconLayoutKanban,
  IconPlus,
  IconTag,
} from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemNavigate } from '@/ui/menu-item/components/MenuItemNavigate';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { ViewFieldsVisibilityDropdownSection } from '@/ui/view-bar/components/ViewFieldsVisibilityDropdownSection';
import { useUpsertView } from '@/ui/view-bar/hooks/useUpsertView';
import { currentViewScopedSelector } from '@/ui/view-bar/states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';
import { ViewFieldForVisibility } from '@/ui/view-bar/types/ViewFieldForVisibility';

import { useBoardCardFields } from '../hooks/useBoardCardFields';
import { useBoardColumns } from '../hooks/useBoardColumns';
import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';
import { boardColumnsState } from '../states/boardColumnsState';
import { savedBoardCardFieldsFamilyState } from '../states/savedBoardCardFieldsFamilyState';
import { hiddenBoardCardFieldsScopedSelector } from '../states/selectors/hiddenBoardCardFieldsScopedSelector';
import { hiddenBoardColumnsScopedSelector } from '../states/selectors/hiddenBoardColumnsScopedSelector';
import { visibleBoardCardFieldsScopedSelector } from '../states/selectors/visibleBoardCardFieldsScopedSelector';
import { visibleBoardColumnsScopedSelector } from '../states/selectors/visibleBoardColumnsScopedSelector';
import { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';
import { OnDragEndResponder } from '@hello-pangea/dnd';

export type BoardOptionsDropdownContentProps = {
  customHotkeyScope: HotkeyScope;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
};

type BoardOptionsMenu = 'fields' | 'stage-creation' | 'stage-edit' | 'stages';

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

  const visibleBoardColumns = useRecoilScopedValue(
    visibleBoardColumnsScopedSelector,
    BoardRecoilScopeContext,
  );

  const hiddenBoardColumns = useRecoilScopedValue(
    hiddenBoardColumnsScopedSelector,
    BoardRecoilScopeContext,
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

    const columnToCreate = {
      id: v4(),
      colorCode: 'gray',
      index: boardColumns.length,
      title: stageInputRef.current.value,
    } as BoardColumnDefinition;

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

  const boardColumnEditFieldComponent = (field: ViewFieldForVisibility) => {
    return (
      <BoardColumnEditTitleMenu
        color={field.colorCode ?? 'gray'}
        onClose={() => console.log('closed')}
        onTitleEdit={() => console.log('closed')}
        title={field.name}
        onDelete={() => console.log('deleted')}
        stageId={field.key}
      />
    );
  };

  const { handleFieldVisibilityChange } = useBoardCardFields();
  const { handleColumnVisibilityChange, handleColumnReorder } = useBoardColumns();

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination || result.destination.index === 0) {
        return;
      }
      //TODO: put this logic in seperate hook for reusablility
      const reorderFields = Array.from(boardColumns);
      const [removed] = reorderFields.splice(result.source.index, 1);
      reorderFields.splice(result.destination.index, 0, removed);

      handleColumnReorder(reorderFields);
    },
    [boardColumns, handleColumnReorder],
  );

  const { closeDropdownButton } = useDropdownButton({
    dropdownId: BoardOptionsDropdownKey,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      resetViewEditMode();
      closeDropdownButton();
    },
    customHotkeyScope.scope,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleStageSubmit();
      handleViewNameSubmit();
      resetViewEditMode();
      closeDropdownButton();
    },
    customHotkeyScope.scope,
  );

  return (
    <StyledDropdownMenu>
      {!currentMenu && (
        <>
          <DropdownMenuInputContainer>
            <DropdownMenuInput
              ref={viewEditInputRef}
              autoFocus={
                viewEditMode.mode === 'create' || !!viewEditMode.viewId
              }
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
          </DropdownMenuInputContainer>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
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
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'stages' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Stages
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <ViewFieldsVisibilityDropdownSection
              title="Visible"
              fields={visibleBoardColumns}
              onVisibilityChange={handleColumnVisibilityChange}
              isDraggable={true}
              fieldAsTag={true}
              onDragEnd={handleReorderField}
              editFieldComponent={boardColumnEditFieldComponent}
            />
            {hiddenBoardColumns.length > 0 && (
              <>
                <StyledDropdownMenuSeparator />
                <ViewFieldsVisibilityDropdownSection
                  title="Hidden"
                  fields={hiddenBoardColumns}
                  onVisibilityChange={handleColumnVisibilityChange}
                  isDraggable={false}
                  fieldAsTag={true}
                />
              </>
            )}
            <StyledDropdownMenuSeparator />
            <MenuItem
              onClick={() => setCurrentMenu('stage-creation')}
              LeftIcon={IconPlus}
              text="Add stage"
            />
          </StyledDropdownMenuItemsContainer>
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
          <StyledDropdownMenuSeparator />
          {hasVisibleFields && (
            <ViewFieldsVisibilityDropdownSection
              title="Visible"
              fields={visibleBoardCardFields}
              onVisibilityChange={handleFieldVisibilityChange}
              isDraggable={true}
            />
          )}
          {hasVisibleFields && hasHiddenFields && (
            <StyledDropdownMenuSeparator />
          )}
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
    </StyledDropdownMenu>
  );
};
