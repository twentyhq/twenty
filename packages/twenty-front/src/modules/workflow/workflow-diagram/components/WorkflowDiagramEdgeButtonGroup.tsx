import styled from '@emotion/styled';
import { IconButtonGroup, IconButtonGroupProps } from 'twenty-ui/input';
import { getWorkflowDiagramNodeSelectedColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramNodeSelectedColors';
import { css } from '@emotion/react';

const StyledIconButtonGroup = styled(IconButtonGroup)<{ selected?: boolean }>`
  pointer-events: all;

  ${({ selected, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramNodeSelectedColors('default', theme);
    return css`
      background-color: ${colors.background};
      border: 1px solid ${colors.borderColor};
    `;
  }}
`;

type WorkflowDiagramEdgeButtonGroupProps = IconButtonGroupProps & {
  selected?: boolean;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  selected = false,
  iconButtons,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  return (
    <StyledIconButtonGroup
      className="nodrag nopan"
      iconButtons={iconButtons}
      selected={selected}
    />
  );
};
