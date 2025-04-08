import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';

export const ActionDisplayer = ({ action }: { action: ActionConfig }) => {
  return (
    <ActionConfigContext.Provider value={action}>
      {action.component}
    </ActionConfigContext.Provider>
  );
};
