import React from 'react';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
  editHotkeysScope,
}: React.PropsWithChildren<{ editHotkeysScope?: HotkeysScopeStackItem }>) {
  const { closeEditableCell, openEditableCell } = useEditableCell();

  useScopedHotkeys(
    'enter',
    () => {
      openEditableCell(
        editHotkeysScope ?? {
          scope: InternalHotkeysScope.CellEditMode,
        },
      );
    },
    InternalHotkeysScope.TableSoftFocus,
    [closeEditableCell, editHotkeysScope],
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

      openEditableCell(
        editHotkeysScope ?? {
          scope: InternalHotkeysScope.CellEditMode,
        },
      );
    },
    InternalHotkeysScope.TableSoftFocus,
    [openEditableCell, editHotkeysScope],
    {
      preventDefault: false,
    },
  );

  return <EditableCellDisplayMode>{children}</EditableCellDisplayMode>;
}
