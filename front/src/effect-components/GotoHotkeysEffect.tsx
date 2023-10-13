import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

export const GotoHotkeysEffect = () => {
  useGoToHotkeys('p', '/people');
  useGoToHotkeys('c', '/companies');
  useGoToHotkeys('o', '/opportunities');
  useGoToHotkeys('s', '/settings/profile');
  useGoToHotkeys('t', '/tasks');

  return <></>;
};
