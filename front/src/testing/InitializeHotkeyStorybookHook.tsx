import { useEffect } from 'react';

import { useSetHotkeyScope } from '../modules/ui/hotkey/hooks/useSetHotkeyScope';
import { AppHotkeyScope } from '../modules/ui/hotkey/types/AppHotkeyScope';

export function InitializeHotkeyStorybookHook() {
  console.log('InitializeHotkeyStorybookHook');
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(AppHotkeyScope.App, { commandMenu: true, goto: false });
  }, [setHotkeyScope]);

  return <></>;
}
