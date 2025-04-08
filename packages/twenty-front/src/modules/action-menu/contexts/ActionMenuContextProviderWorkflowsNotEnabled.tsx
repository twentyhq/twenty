import {
  ActionMenuContext,
  ActionMenuContextType,
} from '@/action-menu/contexts/ActionMenuContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const ActionMenuContextProviderWorkflowsNotEnabled = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  isInRightDrawer: ActionMenuContextType['isInRightDrawer'];
  displayType: ActionMenuContextType['displayType'];
  actionMenuType: ActionMenuContextType['actionMenuType'];
  children: React.ReactNode;
}) => {
  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const actions = useRegisteredActions(params);

  return (
    <ActionMenuContext.Provider
      value={{
        isInRightDrawer,
        displayType,
        actionMenuType,
        actions,
      }}
    >
      {children}
    </ActionMenuContext.Provider>
  );
};
