import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { isEditModeScopedState } from './states/isEditModeScopedState';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';

export function EditableCellSoftFocusMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const [isEditMode] = useRecoilScopedState(isEditModeScopedState);

  const { moveDown } = useMoveSoftFocus();

  const { closeEditableCell, openEditableCell } = useEditableCell();

  useHotkeys(
    'enter',
    () => {
      if (isEditMode) {
        closeEditableCell();
        moveDown();
      } else {
        openEditableCell();
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isEditMode, closeEditableCell],
  );

  useHotkeys(
    '*',
    (keyboardEvent) => {
      if (!isEditMode) {
        const isTextWritingKey = !isNonTextWritingKey(keyboardEvent.key);

        if (!isEditMode && isTextWritingKey) {
          openEditableCell();
        } else {
          keyboardEvent.preventDefault();
        }
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
