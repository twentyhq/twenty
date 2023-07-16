import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { FieldContext } from '../states/FieldContext';
import { isFieldInEditModeScopedState } from '../states/isFieldInEditModeScopedState';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';

// TODO: use atoms for hotkey scopes
export function useEditableField(parentHotkeyScope?: HotkeyScope) {
  const [isFieldInEditMode, setIsFieldInEditMode] = useRecoilScopedState(
    isFieldInEditModeScopedState,
    FieldContext,
  );

  const setHotkeyScope = useSetHotkeyScope();

  function closeEditableField() {
    setIsFieldInEditMode(false);

    if (parentHotkeyScope) {
      setHotkeyScope(parentHotkeyScope.scope, parentHotkeyScope.customScopes);
    }
  }

  function openEditableField(customHotkeyScope?: HotkeyScope) {
    setIsFieldInEditMode(true);

    if (customHotkeyScope) {
      setHotkeyScope(customHotkeyScope.scope, customHotkeyScope.customScopes);
    } else {
      setHotkeyScope(EditableFieldHotkeyScope.EditableField);
    }
  }

  return {
    isFieldInEditMode,
    closeEditableField,
    openEditableField,
  };
}
