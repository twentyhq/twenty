import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { appFocusState } from '@/app-focus/states/appFocusState';
import { useChangeHotkeysScopesToMatchAppFocus } from '@/hotkeys/hooks/useChangeHotkeysScopeToMatchAppFocus';

export function AppHotkeysBindHooks() {
  const changeHotkeysScopesToMatchAppFocus =
    useChangeHotkeysScopesToMatchAppFocus();

  const [appFocus] = useRecoilState(appFocusState);

  useEffect(() => {
    changeHotkeysScopesToMatchAppFocus(appFocus);
  }, [appFocus, changeHotkeysScopesToMatchAppFocus]);

  return <></>;
}
