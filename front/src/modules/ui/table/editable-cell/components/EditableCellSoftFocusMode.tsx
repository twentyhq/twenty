import React from 'react';

import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { isNonTextWritingKey } from '@/ui/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useEditableCell } from '../hooks/useEditableCell';

import {
  EditableCellNormalModeInnerContainer,
  EditableCellNormalModeOuterContainer,
} from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
  editHotkeyScope,
}: React.PropsWithChildren<{ editHotkeyScope?: HotkeyScope }>) {
  const { openEditableCell } = useEditableCell();

  function openEditMode() {
    openEditableCell(
      editHotkeyScope ?? {
        scope: TableHotkeyScope.CellEditMode,
      },
    );
  }

  useScopedHotkeys(
    'enter',
    () => {
      openEditMode();
    },
    TableHotkeyScope.TableSoftFocus,
    [openEditMode],
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      openEditMode();
    },
    TableHotkeyScope.TableSoftFocus,
    [openEditMode],
    {
      preventDefault: false,
    },
  );

  function handleClick() {
    openEditMode();
  }

  return (
    <EditableCellNormalModeOuterContainer
      onClick={handleClick}
      softFocus={true}
    >
      <EditableCellNormalModeInnerContainer>
        {children}
      </EditableCellNormalModeInnerContainer>
    </EditableCellNormalModeOuterContainer>
  );
}
