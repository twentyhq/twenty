import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { isDefined } from '~/utils/isDefined';

import { DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES } from '../constants';
import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopesState';
import { AppHotkeyScope } from '../types/AppHotkeyScope';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

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
  // const { setHotkeyScopes } = useHotkeyScopes();
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (hotkeyScopeToSet: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = await snapshot.getPromise(
          currentHotkeyScopeState,
        );

        if (currentHotkeyScope.scope === hotkeyScopeToSet) {
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

        // set(currentHotkeyScopeState, {
        //   scope: hotkeyScopeToSet,
        //   customScopes: {
        //     commandMenu: customScopes?.commandMenu ?? true,
        //     goto: customScopes?.goto ?? false,
        //   },
        //   _internalId: v4(),
        // });

        const newHotkeyScope: HotkeyScope = {
          scope: hotkeyScopeToSet,
          customScopes: {
            commandMenu: customScopes?.commandMenu ?? true,
            goto: customScopes?.goto ?? false,
          },
        };

        const scopesToSet: string[] = [];

        if (newHotkeyScope.customScopes?.commandMenu) {
          scopesToSet.push(AppHotkeyScope.CommandMenu);
        }

        if (newHotkeyScope?.customScopes?.goto) {
          scopesToSet.push(AppHotkeyScope.Goto);
        }

        scopesToSet.push(newHotkeyScope.scope);

        set(internalHotkeysEnabledScopesState, scopesToSet);
      },
    [],
  );
}
