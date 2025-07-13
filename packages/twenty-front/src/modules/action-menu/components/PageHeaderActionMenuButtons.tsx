import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { useContext } from 'react';
export const PageHeaderActionMenuButtons = () => {
  const { actions } = useContext(ActionMenuContext);

  const pinnedActions = actions.filter((entry) => entry.isPinned);

  return pinnedActions.map((action) => (
    <ActionComponent key={action.key} action={action} />
  ));
};
