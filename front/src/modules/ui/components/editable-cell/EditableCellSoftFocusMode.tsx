import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const { closeEditableCell, openEditableCell } = useEditableCell();

  useHotkeys(
    'enter',
    () => {
      openEditableCell();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeEditableCell],
  );

  useHotkeys(
    '*',
    (keyboardEvent) => {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (isWritingText) {
        openEditableCell();
      } else {
        keyboardEvent.preventDefault();
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: false,
    },
  );

  return <EditableCellDisplayMode>{children}</EditableCellDisplayMode>;
}
