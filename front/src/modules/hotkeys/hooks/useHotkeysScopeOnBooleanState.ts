import { useEffect } from 'react';

import { HotkeysScopeStackItem } from '../types/internal/HotkeysScopeStackItems';

import { useAddToHotkeysScopeStack } from './useAddToHotkeysScopeStack';
import { useRemoveFromHotkeysScopeStack } from './useRemoveFromHotkeysScopeStack';

export function useHotkeysScopeOnBooleanState(
  hotkeysScopeStackItem: HotkeysScopeStackItem,
  booleanState: boolean,
) {
  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();
  const removeFromHotkeysScopeStack = useRemoveFromHotkeysScopeStack();

  useEffect(() => {
    if (booleanState) {
      addToHotkeysScopeStack(hotkeysScopeStackItem);
    } else {
      removeFromHotkeysScopeStack(hotkeysScopeStackItem.scope);
    }
  }, [
    hotkeysScopeStackItem,
    removeFromHotkeysScopeStack,
    addToHotkeysScopeStack,
    booleanState,
  ]);
}
