import { Hotkey } from 'react-hotkeys-hook/dist/types';
import { useRecoilCallback } from 'recoil';

import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopesState';

export function useScopedHotkeyCallback() {
  return useRecoilCallback(
    ({ snapshot }) =>
      ({
        callback,
        hotkeysEvent,
        keyboardEvent,
        scope,
        preventDefault = true,
      }: {
        keyboardEvent: KeyboardEvent;
        hotkeysEvent: Hotkey;
        callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
        scope: string;
        preventDefault?: boolean;
      }) => {
        const currentHotkeyScopes = snapshot
          .getLoadable(internalHotkeysEnabledScopesState)
          .valueOrThrow();

        if (!currentHotkeyScopes.includes(scope)) {
          console.log(
            `I cannot call callback for hotkey ${keyboardEvent.key} because I am not in scope : `,
            scope,
            'and the current hotkey scopes are : ',
            currentHotkeyScopes,
          );

          return;
        }

        console.log(
          `I can call callback for hotkey ${keyboardEvent.key} because I am in scope : `,
          scope,
        );

        if (preventDefault) {
          keyboardEvent.stopPropagation();
          keyboardEvent.preventDefault();
          keyboardEvent.stopImmediatePropagation();
        }

        return callback(keyboardEvent, hotkeysEvent);
      },
    [],
  );
}
