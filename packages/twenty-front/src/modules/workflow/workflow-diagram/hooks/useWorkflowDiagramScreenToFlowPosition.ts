import { useReactFlow } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
export const useWorkflowDiagramScreenToFlowPosition = () => {
  const { screenToFlowPosition } = useReactFlow();

  const workflowDiagramScreenToFlowPosition = (position?: {
    x: number;
    y: number;
  }) => {
    if (!isDefined(position)) {
      return;
    }

    const visibleRightDrawerWidth = Number(
      resolveThemeVariable(themeCssVariables.rightDrawerWidth).replace(
        'px',
        '',
      ),
    );

    const flowPosition = screenToFlowPosition(position);

    return {
      x: flowPosition.x + visibleRightDrawerWidth / 2,
      y: flowPosition.y,
    };
  };

  return { workflowDiagramScreenToFlowPosition };
};
