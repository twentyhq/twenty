import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledButtonGroupContainer = styled.div`
  pointer-events: all;
`;

const StyledSelectedButtonGroupContainer = styled.div`
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
  const { t } = useLingui();
  const Container = selected
    ? StyledSelectedButtonGroupContainer
    : StyledButtonGroupContainer;

  return (
    <Container>
      <ButtonGroup
        aria-label={t`Workflow connection controls`}
        framed
        attached={false}
        className="nodrag nopan"
      >
        {children}
      </ButtonGroup>
    </Container>
  );
};
