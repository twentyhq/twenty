import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramStepNodeLogicFunctionIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeLogicFunctionIcon';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
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

  const usesSmallStroke =
    data.nodeType === 'action' &&
    (CORE_ACTIONS.some((action) => action.type === data.actionType) ||
      RECORD_ACTIONS.some((action) => action.type === data.actionType) ||
      data.actionType === 'IF_ELSE');

  return (
    <Icon
      size={theme.icon.size.md}
      color={
        data.nodeType === 'trigger'
          ? getTriggerIconColor(data.triggerType)
          : getActionIconColorOrThrow(data.actionType)
      }
      stroke={usesSmallStroke ? theme.icon.stroke.sm : undefined}
    />
  );
};
