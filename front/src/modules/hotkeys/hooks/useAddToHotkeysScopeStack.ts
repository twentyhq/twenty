import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { hotkeysScopeStackState } from '../states/internal/hotkeysScopeStackState';
import { HotkeysScopeStackItem } from '../types/internal/HotkeysScopeStackItems';

export function useAddToHotkeysScopeStack() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async ({
        scope,
        customScopes = {
          'command-menu': true,
          goto: false,
        },
        ancestorScope,
      }: HotkeysScopeStackItem) => {
        const hotkeysScopeStack = await snapshot.getPromise(
          hotkeysScopeStackState,
        );

        const currentHotkeysScope =
          hotkeysScopeStack.length > 0
            ? hotkeysScopeStack[hotkeysScopeStack.length - 1]
            : null;

        const previousHotkeysScope =
          hotkeysScopeStack.length > 1
            ? hotkeysScopeStack[hotkeysScopeStack.length - 2]
            : null;

        if (
          scope === currentHotkeysScope?.scope ||
          scope === previousHotkeysScope?.scope
        ) {
          return;
        }

        set(
          hotkeysScopeStackState,
          produce(hotkeysScopeStack, (draft) => {
            draft.push({ scope, customScopes, ancestorScope });
          }),
        );
      },
    [],
  );
}
