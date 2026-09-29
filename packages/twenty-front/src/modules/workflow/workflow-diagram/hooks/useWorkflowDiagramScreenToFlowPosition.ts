import { useReactFlow } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';
export const useWorkflowDiagramScreenToFlowPosition = () => {
  const theme = useTheme();
  const { screenToFlowPosition } = useReactFlow();

  const workflowDiagramScreenToFlowPosition = (position?: {
    x: number;
    y: number;
  }) => {
    if (!isDefined(position)) {
      return;
    }

    const visibleSidePanelWidth = Number(
      theme.sidePanelWidth.replace('px', ''),
    );

    const flowPosition = screenToFlowPosition(position);

    return {
      x: flowPosition.x + visibleSidePanelWidth / 2,
      y: flowPosition.y,
    };
  };

  return { workflowDiagramScreenToFlowPosition };
};
