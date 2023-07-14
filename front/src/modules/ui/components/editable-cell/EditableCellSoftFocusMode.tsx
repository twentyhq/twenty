import React from 'react';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/lib/hotkeys/types/HotkeyScope';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useEditableCell';
import {
  EditableCellNormalModeInnerContainer,
  EditableCellNormalModeOuterContainer,
} from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
  editHotkeysScope,
}: React.PropsWithChildren<{ editHotkeysScope?: HotkeyScope }>) {
  const { openEditableCell } = useEditableCell();

  function openEditMode() {
    openEditableCell(
      editHotkeysScope ?? {
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
