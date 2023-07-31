import { useListenClickOutside } from '@/ui/utilities/click-outside/hooks/useListenClickOutside';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';

import { useEditableField } from './useEditableField';

export function useRegisterCloseFieldHandlers(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onSubmit?: () => void,
  onCancel?: () => void,
) {
  const { closeEditableField, isFieldInEditMode } = useEditableField();

  useListenClickOutside({
    refs: [wrapperRef],
    callback: () => {
      if (isFieldInEditMode) {
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
}
