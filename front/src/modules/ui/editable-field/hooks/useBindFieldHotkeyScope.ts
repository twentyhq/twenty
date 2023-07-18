import { useEffect } from 'react';

import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { isSameHotkeyScope } from '@/ui/hotkey/utils/isSameHotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { customEditHotkeyScopeForFieldScopedState } from '../states/customEditHotkeyScopeForFieldScopedState';
import { FieldContext } from '../states/FieldContext';
import { parentHotkeyScopeForFieldScopedState } from '../states/parentHotkeyScopeForFieldScopedState';

export function useBindFieldHotkeyScope({
  customEditHotkeyScope,
  parentHotkeyScope,
}: {
  customEditHotkeyScope?: HotkeyScope;
  parentHotkeyScope?: HotkeyScope;
}) {
  const [customEditHotkeyScopeForField, setCustomEditHotkeyScopeForField] =
    useRecoilScopedState(
      customEditHotkeyScopeForFieldScopedState,
      FieldContext,
    );

  const [parentHotkeyScopeForField, setParentHotkeyScopeForField] =
    useRecoilScopedState(parentHotkeyScopeForFieldScopedState, FieldContext);

  useEffect(() => {
    if (
      customEditHotkeyScope &&
      !isSameHotkeyScope(customEditHotkeyScope, customEditHotkeyScopeForField)
    ) {
      setCustomEditHotkeyScopeForField(customEditHotkeyScope);
    }
  }, [
    customEditHotkeyScope,
    customEditHotkeyScopeForField,
    setCustomEditHotkeyScopeForField,
  ]);

  useEffect(() => {
    if (
      parentHotkeyScope &&
      !isSameHotkeyScope(parentHotkeyScope, parentHotkeyScopeForField)
    ) {
      setParentHotkeyScopeForField(parentHotkeyScope);
    }
  }, [
    parentHotkeyScope,
    parentHotkeyScopeForField,
    setParentHotkeyScopeForField,
  ]);
}
