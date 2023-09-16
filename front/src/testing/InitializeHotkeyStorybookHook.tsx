import { useEffect } from 'react';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

export const InitializeHotkeyStorybookHookEffect = () => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(AppHotkeyScope.App, { commandMenu: true, goto: false });
  }, [setHotkeyScope]);

  return <></>;
};
