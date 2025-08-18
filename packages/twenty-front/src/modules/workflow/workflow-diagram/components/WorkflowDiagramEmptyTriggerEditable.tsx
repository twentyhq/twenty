import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Label } from 'twenty-ui/display';

const StyledNodeContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 240px;
  min-width: 44px;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  background: ${({ theme }) => theme.background.secondary};
  box-sizing: border-box;
  cursor: pointer;
  position: relative;

  &:hover {
    background: linear-gradient(
        0deg,
        ${({ theme }) => theme.background.transparent.lighter} 0%,
        ${({ theme }) => theme.background.transparent.lighter} 100%
      ),
      ${({ theme }) => theme.background.secondary};
  }

  .react-flow__node.selected & {
    border-color: ${({ theme }) => theme.color.blue};
    background: ${({ theme }) => theme.adaptiveColors.blue1};
  }
`;

const StyledNodeIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledNodeRightPart = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 184px;
  box-sizing: border-box;
`;

const StyledNodeLabelWithCounterPart = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  height: 14px;
  justify-content: space-between;
  box-sizing: border-box;
`;

const StyledNodeLabel = styled(Label)`
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.tertiary};
  flex: 1 0 0;

  .selectable.selected & {
    color: ${({ theme }) => theme.tag.text.blue};
  }
`;

const StyledNodeTitle = styled.div`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.light};
  display: -webkit-box;
  font-family: Inter;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;

  .selectable.selected & {
    color: ${({ theme }) => theme.font.color.primary};
  }
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

  const handleClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    if (!isDefined(workflowVisualizerWorkflowId)) {
      return;
    }

    openWorkflowTriggerTypeInCommandMenu(workflowVisualizerWorkflowId);
  };

  return (
    <StyledNodeContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      onClick={handleClick}
    >
      <StyledNodeIconContainer />

      <StyledNodeRightPart>
        <StyledNodeLabelWithCounterPart>
          <StyledNodeLabel>{t`Trigger`}</StyledNodeLabel>
        </StyledNodeLabelWithCounterPart>

        <StyledNodeTitle>{t`Add a Trigger`}</StyledNodeTitle>
      </StyledNodeRightPart>
    </StyledNodeContainer>
  );
};
