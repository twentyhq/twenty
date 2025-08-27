import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconButtonGroup, type IconButtonGroupProps } from 'twenty-ui/input';

const StyledIconButtonGroup = styled(IconButtonGroup)<{ selected?: boolean }>`
  pointer-events: all;

  ${({ selected, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramColors({ theme });
    return css`
      background-color: ${colors.selected.background};
      border: 1px solid ${colors.selected.borderColor};
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
