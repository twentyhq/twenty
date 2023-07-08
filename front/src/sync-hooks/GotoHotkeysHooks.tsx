import { useGoToHotkeys } from '@/hotkeys/hooks/useGoToHotkeys';

export function GotoHotkeysHooks() {
  useGoToHotkeys('p', '/people');
  useGoToHotkeys('c', '/companies');
  useGoToHotkeys('o', '/opportunities');
  useGoToHotkeys('s', '/settings/profile');

  return <></>;
}
