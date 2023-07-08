import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { hotkeysScopeStackState } from '../states/internal/hotkeysScopeStackState';
import { HotkeysScopeStackItem } from '../types/internal/HotkeysScopeStackItems';

import { useAddToHotkeysScopeStack } from './useAddToHotkeysScopeStack';

export function useHotkeysScopeOnMountOnly(
  hotkeysScopeStackItem: HotkeysScopeStackItem,
) {
  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();

  const [hotkeysScopeStack] = useRecoilState(hotkeysScopeStackState);

  const hotkeysScopeAlreadyInStack = hotkeysScopeStack.some(
    (hotkeysScopeStackItemToFind) =>
      hotkeysScopeStackItemToFind.scope === hotkeysScopeStackItem.scope,
  );

  useEffect(() => {
    if (!hotkeysScopeAlreadyInStack) {
      addToHotkeysScopeStack(hotkeysScopeStackItem);
    }
  }, [
    addToHotkeysScopeStack,
    hotkeysScopeStackItem,
    hotkeysScopeAlreadyInStack,
  ]);
}
