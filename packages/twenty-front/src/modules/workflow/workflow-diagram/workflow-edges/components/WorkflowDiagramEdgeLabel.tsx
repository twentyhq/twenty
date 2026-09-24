import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding-block: ${themeCssVariables.spacing[0.5]};
  padding-inline: ${themeCssVariables.spacing[1]};
`;

const StyledNumber = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type WorkflowDiagramEdgeLabelProps = {
  label: string;
  elseIfIndex?: number;
};

export const WorkflowDiagramEdgeLabel = ({
  label,
  elseIfIndex,
}: WorkflowDiagramEdgeLabelProps) => {
  return (
    <StyledContainer>
      {isDefined(elseIfIndex) && <StyledNumber>{elseIfIndex}</StyledNumber>}
      <StyledDisplayLabel>{label}</StyledDisplayLabel>
    </StyledContainer>
  );
};

const StyledDisplayLabel = styled(Text)`
  color: var(--t-font-color-light);
  font-size: 11px;
  font-weight: var(--t-font-weight-semi-bold);
`;
