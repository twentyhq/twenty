import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { customEditHotkeyScopeForFieldScopedState } from '../states/customEditHotkeyScopeForFieldScopedState';
import { FieldContext } from '../states/FieldContext';
import { isFieldInEditModeScopedState } from '../states/isFieldInEditModeScopedState';
import { parentHotkeyScopeForFieldScopedState } from '../states/parentHotkeyScopeForFieldScopedState';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';

export function useEditableField() {
  const [isFieldInEditMode, setIsFieldInEditMode] = useRecoilScopedState(
    isFieldInEditModeScopedState,
    FieldContext,
  );

  const [customEditHotkeyScopeForField] = useRecoilScopedState(
    customEditHotkeyScopeForFieldScopedState,
    FieldContext,
  );

  const [parentHotkeyScopeForField] = useRecoilScopedState(
    parentHotkeyScopeForFieldScopedState,
    FieldContext,
  );

  const setHotkeyScope = useSetHotkeyScope();

  function closeEditableField() {
    setIsFieldInEditMode(false);

    if (parentHotkeyScopeForField) {
      setHotkeyScope(
        parentHotkeyScopeForField.scope,
        parentHotkeyScopeForField.customScopes,
      );
    }
  }

  function openEditableField() {
    setIsFieldInEditMode(true);

    if (customEditHotkeyScopeForField) {
      setHotkeyScope(
        customEditHotkeyScopeForField.scope,
        customEditHotkeyScopeForField.customScopes,
      );
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
