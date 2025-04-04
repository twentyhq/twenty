import { ActionDisplayer } from '@/action-menu/actions/display/components/ActionDisplayer';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';

export const PageHeaderActionMenuButtons = () => {
  const actionMenuEntries = useRegisteredActions();

  const pinnedActions = actionMenuEntries.filter((entry) => entry.isPinned);

  return pinnedActions.map((action) => (
    <ActionDisplayer key={action.key} action={action} />
  ));
};
