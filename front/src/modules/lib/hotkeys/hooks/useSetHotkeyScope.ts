import { useRecoilCallback } from 'recoil';

import { isDefined } from '@/utils/type-guards/isDefined';

import { DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES } from '../constants';
import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

function isCustomScopesEqual(
  customScopesA: CustomHotkeyScopes | undefined,
  customScopesB: CustomHotkeyScopes | undefined,
) {
  return (
    customScopesA?.commandMenu === customScopesB?.commandMenu &&
    customScopesA?.goto === customScopesB?.goto
  );
}

export function useSetHotkeyScope() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (HotkeyScopeToSet: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = await snapshot.getPromise(
          currentHotkeyScopeState,
        );

        if (currentHotkeyScope.scope === HotkeyScopeToSet) {
          if (!isDefined(customScopes)) {
            if (
              isCustomScopesEqual(
                currentHotkeyScope?.customScopes,
                DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES,
              )
            ) {
              return;
            }
          } else {
            if (
              isCustomScopesEqual(
                currentHotkeyScope?.customScopes,
                customScopes,
              )
            ) {
              return;
            }
          }
        }

        set(currentHotkeyScopeState, {
          scope: HotkeyScopeToSet,
          customScopes: {
            commandMenu: customScopes?.commandMenu ?? true,
            goto: customScopes?.goto ?? false,
          },
        });
      },
    [],
  );
}
