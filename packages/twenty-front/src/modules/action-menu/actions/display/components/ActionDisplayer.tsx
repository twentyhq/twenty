import { ActionConfigContext } from '@/action-menu/actions/components/ActionConfigContext';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';

export const ActionDisplayer = ({ action }: { action: ActionConfig }) => {
  return (
    <ActionConfigContext.Provider value={action}>
      {action.component}
    </ActionConfigContext.Provider>
  );
};
