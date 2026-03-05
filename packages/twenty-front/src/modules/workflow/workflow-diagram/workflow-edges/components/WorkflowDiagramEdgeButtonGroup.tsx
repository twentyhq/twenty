import { styled } from '@linaria/react';
import { IconButtonGroup, type IconButtonGroupProps } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconButtonGroupContainer = styled.div`
  pointer-events: all;
`;

const StyledSelectedIconButtonGroupContainer = styled.div`
  pointer-events: all;

  & > * {
    background-color: ${themeCssVariables.color.blue2};
    border-color: ${themeCssVariables.color.blue};
  }
`;

type WorkflowDiagramEdgeButtonGroupProps = IconButtonGroupProps & {
  selected?: boolean;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  selected = false,
  iconButtons,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  const Container = selected
    ? StyledSelectedIconButtonGroupContainer
    : StyledIconButtonGroupContainer;

  return (
    <Container>
      <IconButtonGroup className="nodrag nopan" iconButtons={iconButtons} />
    </Container>
  );
};
