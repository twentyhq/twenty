import { useReactFlow } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { THEME_COMMON } from 'twenty-ui/theme';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';

export const useWorkflowDiagramScreenToFlowPosition = () => {
  const { screenToFlowPosition } = useReactFlow();
  const { rightDrawerState } = useRightDrawerState();

  const workflowDiagramScreenToFlowPosition = (position?: {
    x: number;
    y: number;
  }) => {
    if (!isDefined(position)) {
      return;
    }

    const flowPosition = screenToFlowPosition(position);

    if (rightDrawerState === 'normal') {
      const visibleRightDrawerWidth = Number(
        THEME_COMMON.rightDrawerWidth.replace('px', ''),
      );

      return {
        x: flowPosition.x + visibleRightDrawerWidth / 2,
        y: flowPosition.y,
      };
    }

    return flowPosition;
  };

  return { workflowDiagramScreenToFlowPosition };
};
