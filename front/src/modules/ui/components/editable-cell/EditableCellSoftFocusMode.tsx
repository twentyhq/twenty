import React from 'react';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
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
        scope: InternalHotkeysScope.CellEditMode,
      },
    );
  }

  useScopedHotkeys(
    'enter',
    () => {
      openEditMode();
    },
    InternalHotkeysScope.TableSoftFocus,
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
    InternalHotkeysScope.TableSoftFocus,
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
