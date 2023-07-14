import React from 'react';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { HotkeysScope } from '@/lib/hotkeys/types/HotkeysScope';
import { HotkeyScope } from '@/ui/tables/types/HotkeyScope';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useEditableCell';
import {
  EditableCellNormalModeInnerContainer,
  EditableCellNormalModeOuterContainer,
} from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
  editHotkeysScope,
}: React.PropsWithChildren<{ editHotkeysScope?: HotkeysScope }>) {
  const { openEditableCell } = useEditableCell();

  function openEditMode() {
    openEditableCell(
      editHotkeysScope ?? {
        scope: HotkeyScope.CellEditMode,
      },
    );
  }

  useScopedHotkeys(
    'enter',
    () => {
      openEditMode();
    },
    HotkeyScope.TableSoftFocus,
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
    HotkeyScope.TableSoftFocus,
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
