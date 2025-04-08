import { ActionDisplayer } from '@/action-menu/actions/display/components/ActionDisplayer';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { useContext } from 'react';
export const PageHeaderActionMenuButtons = () => {
  const { actions } = useContext(ActionMenuContext);

  const pinnedActions = actions.filter((entry) => entry.isPinned);

  return pinnedActions.map((action) => (
    <ActionDisplayer key={action.key} action={action} />
  ));
};
