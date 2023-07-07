import { useRecoilValue } from 'recoil';

import { appFocusHistoryState } from '@/app-focus/states/appFocusHistoryState';
import { useGoToHotkeys } from '@/hotkeys/hooks/useGoToHotkeys';

export function AppHotkeysHooks() {
  useGoToHotkeys('p', '/people');
  useGoToHotkeys('c', '/companies');
  useGoToHotkeys('o', '/opportunities');
  useGoToHotkeys('s', '/settings/profile');

  useRecoilValue(appFocusHistoryState);

  return <></>;
}
