import { PropsWithChildren } from 'react';

import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useEditableCell } from '../hooks/useEditableCell';

import { EditableCellDisplayContainer } from './EditableCellContainer';

type OwnProps = PropsWithChildren<unknown>;

export function EditableCellSoftFocusMode({ children }: OwnProps) {
  const { openEditableCell } = useEditableCell();

  function openEditMode() {
    openEditableCell();
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
    <EditableCellDisplayContainer onClick={handleClick} softFocus>
      {children}
    </EditableCellDisplayContainer>
  );
}
