import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { appFocusState } from '@/app-focus/states/appFocusState';
import { useChangeHotkeysScopesToMatchAppFocus } from '@/hotkeys/hooks/useChangeHotkeysScopeToMatchAppFocus';

export function AppHotkeysBindHooks() {
  const changeHotkeysScopesToMatchAppFocus =
    useChangeHotkeysScopesToMatchAppFocus();

  const { enabledScopes } = useHotkeysContext();
  const [appFocus] = useRecoilState(appFocusState);

  useEffect(() => {
    changeHotkeysScopesToMatchAppFocus(appFocus);
  }, [appFocus, changeHotkeysScopesToMatchAppFocus]);

  console.log({ appFocus, enabledScopes });

  return <></>;
}
