import { useEffect } from 'react';
import { AppHotkeyScope, useSetHotkeyScope } from 'twenty-ui';

export const InitializeHotkeyStorybookHookEffect = () => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(AppHotkeyScope.App, {
      commandMenu: true,
      goto: false,
      keyboardShortcutMenu: false,
    });
  }, [setHotkeyScope]);

  return <></>;
};
