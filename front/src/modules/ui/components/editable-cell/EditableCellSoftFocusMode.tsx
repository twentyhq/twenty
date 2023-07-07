import React from 'react';

import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const { closeEditableCell, openEditableCell } = useEditableCell();

  useDirectHotkeys(
    'enter',
    () => {
      openEditableCell();
    },
    ['table-body'],
    [closeEditableCell],
  );

  useDirectHotkeys(
    '*',
    (keyboardEvent) => {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      openEditableCell();
    },
    ['table-body'],
    [openEditableCell],
    {
      preventDefault: false,
    },
  );

  return <EditableCellDisplayMode>{children}</EditableCellDisplayMode>;
}
