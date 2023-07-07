import { useHotkeysContext } from 'react-hotkeys-hook';

import { ALWAYS_ON_HOTKEYS_SCOPES } from '../constants';
import { HotkeysScope } from '../types/HotkeysScope';

export function useSwitchToHotkeysScope() {
  const { enableScope, enabledScopes, disableScope } = useHotkeysContext();

  return function switchToHotkeysScope(hotkeysScope: HotkeysScope) {
    const enabledScopesExceptAlwaysOnScopes = enabledScopes.filter(
      (scope) => !ALWAYS_ON_HOTKEYS_SCOPES.includes(scope as HotkeysScope),
    );

    for (const scope of enabledScopesExceptAlwaysOnScopes) {
      disableScope(scope as HotkeysScope);
    }

    enableScope(hotkeysScope);
  };
}
