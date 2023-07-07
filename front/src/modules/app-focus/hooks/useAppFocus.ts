import { useRecoilState } from 'recoil';

import { appFocusState } from '../states/appFocusState';

import { useRemoveAppFocus } from './useRemoveAppFocus';
import { useSwitchToAppFocus } from './useSwitchToAppFocus';

export function useAppFocus() {
  const [appFocus] = useRecoilState(appFocusState);

  const removeAppFocus = useRemoveAppFocus();
  const switchToAppFocus = useSwitchToAppFocus();

  return { appFocus, removeAppFocus, switchToAppFocus };
}
