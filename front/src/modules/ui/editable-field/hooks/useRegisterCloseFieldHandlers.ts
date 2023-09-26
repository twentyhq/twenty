import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';

import { useInlineCell } from './useInlineCell';

export const useRegisterCloseFieldHandlers = (
  wrapperRef: React.RefObject<HTMLDivElement>,
  onSubmit?: () => void,
  onCancel?: () => void,
) => {
  const { closeInlineCell: closeEditableField, isInlineCellInEditMode } =
    useInlineCell();

  useListenClickOutside({
    refs: [wrapperRef],
    callback: () => {
      if (isInlineCellInEditMode) {
        onSubmit?.();
        closeEditableField();
      }
    },
  });

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit?.();
      closeEditableField();
    },
    EditableFieldHotkeyScope.EditableField,
    [closeEditableField, onSubmit],
  );

  useScopedHotkeys(
    'esc',
    () => {
      closeEditableField();
      onCancel?.();
    },
    EditableFieldHotkeyScope.EditableField,
    [closeEditableField, onCancel],
  );
};
