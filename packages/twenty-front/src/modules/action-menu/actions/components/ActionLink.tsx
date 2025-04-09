import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { AppPath } from '@/types/AppPath';
import { useContext } from 'react';
import { PathParam } from 'react-router-dom';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const ActionLink = <T extends AppPath>({
  to,
  params,
  queryParams,
}: {
  to: T;
  params?: { [key in PathParam<T>]: string | null };
  queryParams?: Record<string, any>;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { closeActionMenu } = useCloseActionMenu();

  if (!actionConfig) {
    return null;
  }

  const path = getAppPath(to, params, queryParams);

  return (
    <ActionDisplay
      action={{ ...actionConfig }}
      onClick={closeActionMenu}
      to={path}
    />
  );
};
