import { useEffect } from 'react';

import { HotkeysScopeStackItem } from '../types/internal/HotkeysScopeStackItems';

import { useAddToHotkeysScopeStack } from './useAddToHotkeysScopeStack';
import { useRemoveFromHotkeysScopeStack } from './useRemoveFromHotkeysScopeStack';

export function useHotkeysScopeOnBooleanState(
  hotkeysScopeStackItem: HotkeysScopeStackItem,
  booleanState: boolean,
) {
  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();
  const removeFromHoteysScopeStack = useRemoveFromHotkeysScopeStack();

  useEffect(() => {
    if (booleanState) {
      addToHotkeysScopeStack(hotkeysScopeStackItem);
    } else {
      removeFromHoteysScopeStack(hotkeysScopeStackItem.scope);
    }
  }, [
    hotkeysScopeStackItem,
    removeFromHoteysScopeStack,
    addToHotkeysScopeStack,
    booleanState,
  ]);
}
