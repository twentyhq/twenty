import { getActionIconStrokeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconStrokeOrThrow';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramStepNodeLogicFunctionIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeLogicFunctionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';

export const WorkflowDiagramStepNodeIcon = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(getWorkflowNodeIconKey(data));

  if (data.nodeType === 'action' && data.actionType === 'EMPTY') {
    return null;
  }

  if (data.nodeType === 'action' && data.actionType === 'LOGIC_FUNCTION') {
    return (
      <WorkflowDiagramStepNodeLogicFunctionIcon
        logicFunctionId={data.logicFunctionId}
      />
    );
  }

  const stroke =
    data.nodeType === 'action'
      ? getActionIconStrokeOrThrow(data.actionType)
      : undefined;

  return (
    <Icon
      size={theme.icon.size.md}
      color={
        data.nodeType === 'trigger'
          ? getTriggerIconColor(data.triggerType)
          : getActionIconColorOrThrow(data.actionType)
      }
      stroke={stroke === undefined ? undefined : theme.icon.stroke[stroke]}
    />
  );
};
