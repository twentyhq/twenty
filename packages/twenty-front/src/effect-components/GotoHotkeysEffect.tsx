import { useGoToHotkeys } from 'twenty-ui';

export const GotoHotkeysEffect = () => {
  useGoToHotkeys('p', '/objects/people');
  useGoToHotkeys('c', '/objects/companies');
  useGoToHotkeys('o', '/objects/opportunities');
  useGoToHotkeys('s', '/settings/profile');
  useGoToHotkeys('t', '/tasks');

  return <></>;
};
