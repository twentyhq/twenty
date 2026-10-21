import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { ButtonGroup } from 'twenty-ui/primitives/input';

const StyledButtonGroupContainer = styled.div`
  pointer-events: all;
`;

type WorkflowDiagramEdgeButtonGroupProps = {
  children: ReactNode;
};

export const WorkflowDiagramEdgeButtonGroup = ({
  children,
}: WorkflowDiagramEdgeButtonGroupProps) => {
  const { t } = useLingui();

  return (
    <StyledButtonGroupContainer>
      <ButtonGroup
        aria-label={t`Workflow connection controls`}
        framed
        attached={false}
        className="nodrag nopan"
      >
        {children}
      </ButtonGroup>
    </StyledButtonGroupContainer>
  );
};
