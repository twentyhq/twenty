import { useReactFlow } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { THEME_COMMON } from 'twenty-ui/theme';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { useContext } from 'react';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

export const useWorkflowDiagramScreenToFlowPosition = () => {
  const { screenToFlowPosition } = useReactFlow();

  const { rightDrawerState } = useRightDrawerState();
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowDiagramScreenToFlowPosition = (position?: {
    x: number;
    y: number;
  }) => {
    if (!isDefined(position)) {
      return;
    }

    let visibleRightDrawerWidth = 0;
    if (rightDrawerState === 'normal' && !isInRightDrawer) {
      visibleRightDrawerWidth = Number(
        THEME_COMMON.rightDrawerWidth.replace('px', ''),
      );
    }

    const flowPosition = screenToFlowPosition(position);

    return {
      x: flowPosition.x + visibleRightDrawerWidth / 2,
      y: flowPosition.y,
    };
  };

  return { workflowDiagramScreenToFlowPosition };
};
