import { useContext } from 'react';

import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { Label } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';

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
  const { theme } = useContext(ThemeContext);
  const colors = getWorkflowDiagramColors({ theme, runStatus });
  const labelColor = selected ? colors.selected.color : colors.unselected.color;

  return (
    <StyledNodeLabelWrapper labelColor={labelColor} className={className}>
      <Label>{children}</Label>
    </StyledNodeLabelWrapper>
  );
};
