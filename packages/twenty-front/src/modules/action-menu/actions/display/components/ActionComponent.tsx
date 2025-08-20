import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';

export const ActionComponent = ({ action }: { action: ActionConfig }) => {
  return (
    <ActionConfigContext.Provider value={action}>
      {action.component}
    </ActionConfigContext.Provider>
  );
};
