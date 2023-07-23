import { useGoToHotkeys } from '@/ui/hotkey/hooks/useGoToHotkeys';

export function GotoHotkeysHooks() {
  console.log('GotoHotkeysHooks');
  useGoToHotkeys('p', '/people');
  useGoToHotkeys('c', '/companies');
  useGoToHotkeys('o', '/opportunities');
  useGoToHotkeys('s', '/settings/profile');

  return <></>;
}
