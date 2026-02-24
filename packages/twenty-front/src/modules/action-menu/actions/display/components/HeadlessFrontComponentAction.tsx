import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { isHeadlessFrontComponentMountedFamilySelector } from '@/front-components/selectors/isHeadlessFrontComponentMountedFamilySelector';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { useContext } from 'react';

import { ActionDisplay } from './ActionDisplay';

export const HeadlessFrontComponentAction = ({
  frontComponentId,
  onClick,
}: {
  frontComponentId: string;
  onClick: () => void;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution: false,
    closeSidePanelOnCommandMenuListActionExecution: false,
  });

  const isMounted = useFamilySelectorValue(
    isHeadlessFrontComponentMountedFamilySelector,
    frontComponentId,
  );

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    if (isMounted) {
      return;
    }

    closeActionMenu();
    onClick();
  };

  return <ActionDisplay onClick={handleClick} disabled={isMounted} />;
};
