import styled from '@emotion/styled';
import { Pill } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
    {isDeprecated && <Pill label="Deprecated" />}
  </StyledLabelRow>
);
