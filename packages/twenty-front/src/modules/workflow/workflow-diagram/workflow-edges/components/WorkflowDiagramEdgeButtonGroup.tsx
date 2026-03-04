import { styled } from '@linaria/react';
import { IconButtonGroup, type IconButtonGroupProps } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledSelectedIconButtonGroup = styled(StyledIconButtonGroup)`
  background-color: ${themeCssVariables.color.blue2};
  border-color: ${themeCssVariables.color.blue};
`;

type WorkflowDiagramEdgeButtonGroupProps = IconButtonGroupProps & {
  selected?: boolean;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  selected = false,
  iconButtons,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  const ButtonGroup = selected
    ? StyledSelectedIconButtonGroup
    : StyledIconButtonGroup;

  return <ButtonGroup className="nodrag nopan" iconButtons={iconButtons} />;
};
