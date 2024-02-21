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
import useI18n from '@/ui/i18n/useI18n';
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
import { moveArrayItem } from '~/utils/array/moveArrayItem';

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
  const { translate } = useI18n('translations');
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

      const reorderedFields = moveArrayItem(visibleBoardCardFields, {
        fromIndex: result.source.index - 1,
        toIndex: result.destination.index - 1,
      });

      handleFieldsReorder(reorderedFields);
    },
    [handleFieldsReorder, visibleBoardCardFields],
  );

  useScopedHotkeys(
    [Key.Escape],
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
                ? translate('newView')
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
              text={translate('fields')}
            />
            <MenuItemNavigate
              onClick={() => handleMenuNavigate('stages')}
              LeftIcon={IconLayoutKanban}
              text={translate('stages')}
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconBaselineDensitySmall}
              onToggleChange={setIsCompactViewEnabled}
              toggled={isCompactViewEnabled}
              text={translate('compactView')}
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'stages' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            {translate('stages')}
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setCurrentMenu('stage-creation')}
              LeftIcon={IconPlus}
              text={translate('addStage')}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'stage-creation' && (
        <DropdownMenuSearchInput
          autoFocus
          placeholder={translate('newStage')}
          ref={stageInputRef}
        />
      )}
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            {translate('fields')}
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          {hasVisibleFields && (
            <ViewFieldsVisibilityDropdownSection
              title={translate('visible')}
              fields={visibleBoardCardFields}
              isDraggable
              onDragEnd={handleReorderField}
              onVisibilityChange={handleFieldVisibilityChange}
            />
          )}
          {hasVisibleFields && hasHiddenFields && <DropdownMenuSeparator />}
          {hasHiddenFields && (
            <ViewFieldsVisibilityDropdownSection
              title={translate('hidden')}
              fields={hiddenBoardCardFields}
              isDraggable={false}
              onVisibilityChange={handleFieldVisibilityChange}
            />
          )}
        </>
      )}
    </>
  );
};
