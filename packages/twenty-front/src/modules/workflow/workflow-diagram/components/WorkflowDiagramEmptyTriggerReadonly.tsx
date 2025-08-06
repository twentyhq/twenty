import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowDiagramEmptyTriggerReadonly = () => {
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  return (
    <WorkflowDiagramStepNodeBase
      id="trigger"
      name={t`Add a Trigger`}
      nodeType="trigger"
      variant="empty"
      Icon={<StyledStepNodeLabelIconContainer />}
      onClick={() => {
        if (
          !isDefined(workflowVisualizerWorkflowId) ||
          !isDefined(workflowVisualizerWorkflowVersionId)
        ) {
          throw new Error(
            'Workflow ID and Version ID must be defined to open the command menu.',
          );
        }

        if (!isInRightDrawer) {
          setCommandMenuNavigationStack([]);
        }

        setWorkflowSelectedNode(TRIGGER_STEP_ID);

        openWorkflowViewStepInCommandMenu({
          workflowId: workflowVisualizerWorkflowId,
          workflowVersionId: workflowVisualizerWorkflowVersionId,
          title: t`Add a Trigger`,
          icon: getIcon(null),
        });
      }}
    />
  );
};
