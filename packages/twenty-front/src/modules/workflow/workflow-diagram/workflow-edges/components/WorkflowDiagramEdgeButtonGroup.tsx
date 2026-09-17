import { styled } from '@linaria/react';
import { IconButtonGroup } from 'twenty-ui/components';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconButtonGroupContainer = styled.div`
  pointer-events: all;
`;

const StyledSelectedIconButtonGroupContainer = styled.div`
  background-color: ${themeCssVariables.color.blue2};
  border-color: ${themeCssVariables.color.blue};
  pointer-events: all;
`;

type WorkflowDiagramEdgeButtonGroupProps = {
  children: ReactNode;
  selected?: boolean;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  selected = false,
  children,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  const Container = selected
    ? StyledSelectedIconButtonGroupContainer
    : StyledIconButtonGroupContainer;

  return (
    <Container>
      <IconButtonGroup className="nodrag nopan">{children}</IconButtonGroup>
    </Container>
  );
};
