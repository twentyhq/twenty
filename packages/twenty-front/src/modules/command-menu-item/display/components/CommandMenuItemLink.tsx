import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { useCloseActionMenu } from '@/command-menu-item/hooks/useCloseActionMenu';
import { type PathParam } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const CommandMenuItemLink = <T extends AppPath>({
  to,
  params,
  queryParams,
}: {
  to: T;
  params?: { [key in PathParam<T>]: string | null };
  queryParams?: Record<string, any>;
}) => {
  const { closeActionMenu } = useCloseActionMenu();

  const path = getAppPath(to, params, queryParams);

  return <CommandMenuItemDisplay onClick={closeActionMenu} to={path} />;
};
