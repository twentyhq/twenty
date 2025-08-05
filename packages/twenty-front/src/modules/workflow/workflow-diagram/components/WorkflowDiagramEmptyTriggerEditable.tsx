import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowDiagramEmptyTriggerEditable = () => {
  const { openWorkflowTriggerTypeInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  return (
    <WorkflowDiagramStepNodeBase
      name="Add a Trigger"
      nodeType="trigger"
      variant="empty"
      Icon={<StyledStepNodeLabelIconContainer />}
      onClick={() => {
        if (!isInRightDrawer) {
          setCommandMenuNavigationStack([]);
        }

        if (!isDefined(workflowVisualizerWorkflowId)) {
          return;
        }

        openWorkflowTriggerTypeInCommandMenu(workflowVisualizerWorkflowId);
      }}
    />
  );
};
