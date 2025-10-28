import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { type PathParam } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const ActionLink = <T extends AppPath>({
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

  return <ActionDisplay onClick={closeActionMenu} to={path} />;
};
