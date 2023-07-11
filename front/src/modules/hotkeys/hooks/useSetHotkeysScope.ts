import { useRecoilCallback } from 'recoil';

import { isDefined } from '@/utils/type-guards/isDefined';

import { DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES } from '../constants';
import { currentHotkeysScopeState } from '../states/internal/currentHotkeysScopeState';
import { CustomHotkeysScopes } from '../types/internal/CustomHotkeysScope';

export function useSetHotkeysScope() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (hotkeysScopeToSet: string, customScopes?: CustomHotkeysScopes) => {
        const currentHotkeysScope = await snapshot.getPromise(
          currentHotkeysScopeState,
        );

        function isCustomScopesEqual(
          customScopesA: CustomHotkeysScopes | undefined,
          customScopesB: CustomHotkeysScopes | undefined,
        ) {
          return (
            customScopesA?.commandMenu === customScopesB?.commandMenu &&
            customScopesA?.goto === customScopesB?.goto
          );
        }

        if (currentHotkeysScope.scope === hotkeysScopeToSet) {
          if (!isDefined(customScopes)) {
            if (
              isCustomScopesEqual(
                currentHotkeysScope?.customScopes,
                DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES,
              )
            ) {
              return;
            }
          } else {
            if (
              isCustomScopesEqual(
                currentHotkeysScope?.customScopes,
                customScopes,
              )
            ) {
              return;
            }
          }
        }

        set(currentHotkeysScopeState, {
          scope: hotkeysScopeToSet,
          customScopes: {
            commandMenu: customScopes?.commandMenu ?? true,
            goto: customScopes?.goto ?? false,
          },
        });
      },
    [],
  );
}
