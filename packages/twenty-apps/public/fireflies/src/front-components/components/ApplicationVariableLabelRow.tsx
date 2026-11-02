import styled from '@emotion/styled';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.light};
  font-family: ${() => themeCssVariables.font.family};
  font-size: 11px;
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

type ApplicationVariableLabelRowProps = {
  variableKey: string;
  isDeprecated: boolean;
  inputId: string;
};

export const ApplicationVariableLabelRow = ({
  variableKey,
  isDeprecated,
  inputId,
}: ApplicationVariableLabelRowProps) => (
  <StyledLabelRow>
    <StyledLabel htmlFor={inputId}>{variableKey}</StyledLabel>
    {isDeprecated && <Badge>Deprecated</Badge>}
  </StyledLabelRow>
);
