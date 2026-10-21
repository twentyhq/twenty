import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { Text } from 'twenty-ui/primitives/typography';

type WorkflowNodeLabelProps = {
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
  children?: React.ReactNode;
  className?: string;
};

const StyledNodeLabelWrapper = styled.div`
  box-sizing: border-box;
  flex: 1 0 0;
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
    <StyledNodeLabelWrapper className={className}>
      <Text
        size="xs"
        weight="semibold"
        color="light"
        style={{ color: labelColor }}
      >
        {children}
      </Text>
    </StyledNodeLabelWrapper>
  );
};
