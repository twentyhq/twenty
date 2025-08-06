import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();

  const { openWorkflowTriggerTypeInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

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
