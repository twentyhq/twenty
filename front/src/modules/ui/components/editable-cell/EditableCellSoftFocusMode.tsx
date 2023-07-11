import React from 'react';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useEditableCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
  editHotkeysScope,
}: React.PropsWithChildren<{ editHotkeysScope?: HotkeysScope }>) {
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
