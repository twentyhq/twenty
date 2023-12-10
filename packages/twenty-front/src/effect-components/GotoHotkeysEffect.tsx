import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

export const GotoHotkeysEffect = () => {
  useGoToHotkeys('p', '/objects/people');
  useGoToHotkeys('c', '/objects/companies');
  useGoToHotkeys('o', '/objects/opportunities');
  useGoToHotkeys('s', '/settings/profile');
  useGoToHotkeys('t', '/tasks');

  return <></>;
};
