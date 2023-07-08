import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { DEFAULT_HOTKEYS_SCOPE_STACK_ITEM } from '../constants';
import { hotkeysScopeStackState } from '../states/internal/hotkeysScopeStackState';
import { InternalHotkeysScope } from '../types/internal/InternalHotkeysScope';

export function useRemoveFromHotkeysScopeStack() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (hotkeysScopeToRemove: string) => {
        const hotkeysScopeStack = await snapshot.getPromise(
          hotkeysScopeStackState,
        );

        if (hotkeysScopeStack.length < 1) {
          set(hotkeysScopeStackState, [DEFAULT_HOTKEYS_SCOPE_STACK_ITEM]);

          return;
        }

        const currentHotkeysScope =
          hotkeysScopeStack[hotkeysScopeStack.length - 1];

        if (hotkeysScopeStack.length === 1) {
          if (currentHotkeysScope?.scope !== InternalHotkeysScope.App) {
            set(hotkeysScopeStackState, [DEFAULT_HOTKEYS_SCOPE_STACK_ITEM]);
          }

          return;
        }

        const previousHotkeysScope =
          hotkeysScopeStack[hotkeysScopeStack.length - 2];

        if (
          previousHotkeysScope.scope === hotkeysScopeToRemove ||
          currentHotkeysScope.scope !== hotkeysScopeToRemove
        ) {
          return;
        }

        set(
          hotkeysScopeStackState,
          produce(hotkeysScopeStack, (draft) => {
            return draft.filter(
              (hotkeysScope) => hotkeysScope.scope !== hotkeysScopeToRemove,
            );
          }),
        );
      },
    [],
  );
}
