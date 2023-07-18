import { PropsWithChildren } from 'react';

import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { isNonTextWritingKey } from '@/ui/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useEditableCell } from '../hooks/useEditableCell';

import { EditableCellDisplayContainer } from './EditableCellContainer';

type OwnProps = PropsWithChildren<{
  editHotkeyScope?: HotkeyScope;
}>;

export function EditableCellSoftFocusMode({
  children,
  editHotkeyScope,
}: OwnProps) {
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
    <EditableCellDisplayContainer onClick={handleClick} softFocus>
      {children}
    </EditableCellDisplayContainer>
  );
}
