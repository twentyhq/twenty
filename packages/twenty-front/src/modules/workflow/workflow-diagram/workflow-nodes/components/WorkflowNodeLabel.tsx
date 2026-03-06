import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { Label } from 'twenty-ui/display';

type WorkflowNodeLabelProps = {
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
  children?: React.ReactNode;
  className?: string;
};

const StyledNodeLabelWrapper = styled.div<{ labelColor: string }>`
  box-sizing: border-box;
  flex: 1 0 0;

  > div {
    color: ${({ labelColor }) => labelColor};
  }
`;

export const WorkflowNodeLabel = ({
  runStatus,
  selected,
  children,
  className,
}: WorkflowNodeLabelProps) => {
  const colors = getWorkflowDiagramColors({ runStatus });
  const labelColor = selected ? colors.selected.color : colors.unselected.color;

  return (
    <StyledNodeLabelWrapper labelColor={labelColor} className={className}>
      <Label>{children}</Label>
    </StyledNodeLabelWrapper>
  );
};
