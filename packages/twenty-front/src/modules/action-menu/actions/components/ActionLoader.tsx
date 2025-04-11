import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useContext } from 'react';

export const ActionLoader = () => {
  const actionConfig = useContext(ActionConfigContext);

  if (!actionConfig) {
    return null;
  }

  return <ActionDisplay action={actionConfig} />;
};
