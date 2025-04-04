import { ActionConfigContext } from '@/action-menu/actions/components/ActionConfigContext';
import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useContext } from 'react';

export const ActionLink = ({ to }: { to: string }) => {
  const actionConfig = useContext(ActionConfigContext);

  if (!actionConfig) {
    return null;
  }

  return <ActionDisplay action={{ ...actionConfig, to }} />;
};
