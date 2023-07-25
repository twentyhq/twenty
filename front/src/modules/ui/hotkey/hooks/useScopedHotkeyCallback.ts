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
            `I can't handle ${keyboardEvent.key} for scope: ${scope}, because current hotkey scopes are: ${currentHotkeyScopes}`,
          );
          return;
        }

        console.log(
          `I can handle ${keyboardEvent.key} for scope: ${scope}, because current hotkey scopes are: ${currentHotkeyScopes}`,
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
