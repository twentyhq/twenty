import { useCallback, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { BoardOptionsDropdownId } from '@/object-record/record-board-deprecated/constants/BoardOptionsDropdownId';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
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
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';

import { useRecordBoardDeprecatedCardFieldsInternal } from '../../hooks/internal/useRecordBoardDeprecatedCardFieldsInternal';
import { BoardColumnDefinition } from '../../types/BoardColumnDefinition';
import { BoardOptionsHotkeyScope } from '../../types/BoardOptionsHotkeyScope';

export type RecordBoardDeprecatedOptionsDropdownContentProps = {
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
  recordBoardId: string;
};

type BoardOptionsMenu = 'fields' | 'stage-creation' | 'stages';

export const RecordBoardDeprecatedOptionsDropdownContent = ({
  onStageAdd,
  recordBoardId,
}: RecordBoardDeprecatedOptionsDropdownContentProps) => {
  const { setViewEditMode, handleViewNameSubmit } = useViewBar();
  const { viewEditModeState, currentViewSelector } = useViewScopedStates();

  const viewEditMode = useRecoilValue(viewEditModeState);
  const currentView = useRecoilValue(currentViewSelector);

  const stageInputRef = useRef<HTMLInputElement>(null);
  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [currentMenu, setCurrentMenu] = useState<
    BoardOptionsMenu | undefined
  >();

  const {
    boardColumnsState,
    isCompactViewEnabledState,
    hiddenBoardCardFieldsSelector,
    visibleBoardCardFieldsSelector,
  } = useRecordBoardDeprecatedScopedStates({
    recordBoardScopeId: recordBoardId,
  });

  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);
  const [isCompactViewEnabled, setIsCompactViewEnabled] = useRecoilState(
    isCompactViewEnabledState,
  );

  const hiddenBoardCardFields = useRecoilValue(hiddenBoardCardFieldsSelector);
  const hasHiddenFields = hiddenBoardCardFields.length > 0;

  const visibleBoardCardFields = useRecoilValue(visibleBoardCardFieldsSelector);
  const hasVisibleFields = visibleBoardCardFields.length > 0;

  const handleStageSubmit = () => {
    if (currentMenu !== 'stage-creation' || !stageInputRef?.current?.value)
      return;

    const columnToCreate: BoardColumnDefinition = {
      id: v4(),
      colorCode: 'gray',
      position: boardColumns.length,
      title: stageInputRef.current.value,
    };

    setBoardColumns((previousBoardColumns) => [
      ...previousBoardColumns,
      columnToCreate,
    ]);
    onStageAdd?.(columnToCreate);
  };

  const resetMenu = () => setCurrentMenu(undefined);

  const handleMenuNavigate = (menu: BoardOptionsMenu) => {
    handleViewNameSubmit();
    setCurrentMenu(menu);
  };

  const { handleFieldVisibilityChange, handleFieldsReorder } =
    useRecordBoardDeprecatedCardFieldsInternal({
      recordBoardScopeId: recordBoardId,
    });

  const { closeDropdown } = useDropdown(BoardOptionsDropdownId);

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const reorderFields = [...visibleBoardCardFields];
      const [removed] = reorderFields.splice(result.source.index - 1, 1);
      reorderFields.splice(result.destination.index - 1, 0, removed);

      handleFieldsReorder(reorderFields);
    },
    [handleFieldsReorder, visibleBoardCardFields],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      setViewEditMode('none');
      closeDropdown();
    },
    BoardOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      const name = viewEditInputRef.current?.value;
      resetMenu();
      setViewEditMode('none');
      handleStageSubmit();
      handleViewNameSubmit(name);
      closeDropdown();
    },
    BoardOptionsHotkeyScope.Dropdown,
  );

  return (
    <>
      {!currentMenu && (
        <>
          <DropdownMenuInput
            ref={viewEditInputRef}
            autoFocus={viewEditMode !== 'none'}
            placeholder={
              viewEditMode === 'create'
                ? 'New view'
                : viewEditMode === 'edit'
                  ? 'View name'
                  : ''
            }
            defaultValue={viewEditMode === 'create' ? '' : currentView?.name}
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
              isVisible={true}
              onVisibilityChange={handleFieldVisibilityChange}
              isDraggable={true}
              onDragEnd={handleReorderField}
            />
          )}
          {hasVisibleFields && hasHiddenFields && <DropdownMenuSeparator />}
          {hasHiddenFields && (
            <ViewFieldsVisibilityDropdownSection
              title="Hidden"
              fields={hiddenBoardCardFields}
              isVisible={false}
              onVisibilityChange={handleFieldVisibilityChange}
              isDraggable={false}
            />
          )}
        </>
      )}
    </>
  );
};
