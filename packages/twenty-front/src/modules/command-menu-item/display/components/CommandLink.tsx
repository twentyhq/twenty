import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { type PathParam } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const CommandLink = <T extends AppPath>({
  to,
  params,
  queryParams,
}: {
  to: T;
  params?: { [key in PathParam<T>]: string | null };
  queryParams?: Record<string, any>;
}) => {
  const { closeCommandMenu } = useCloseCommandMenu();

  const path = getAppPath(to, params, queryParams);

  return <CommandMenuItemDisplay onClick={closeCommandMenu} to={path} />;
};
