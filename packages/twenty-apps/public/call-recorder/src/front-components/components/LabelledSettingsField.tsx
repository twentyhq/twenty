import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
`;

// twenty-front hard-codes this size in FieldLabel.module.scss; there is no token.
const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.light};
  font-family: ${() => themeCssVariables.font.family};
  font-size: 11px;
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledHint = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin-top: ${() => themeCssVariables.spacing[3]};
`;

const StyledError = styled.span`
  color: ${() => themeCssVariables.font.color.danger};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-top: ${() => themeCssVariables.spacing[1]};
`;

type LabelledSettingsFieldProps = {
  label: string;
  inputId: string;
  hint?: string;
  errorMessage?: string;
  children: ReactNode;
};

export const LabelledSettingsField = ({
  label,
  inputId,
  hint,
  errorMessage,
  children,
}: LabelledSettingsFieldProps) => (
  <StyledField>
    <StyledLabel htmlFor={inputId}>{label}</StyledLabel>
    {children}
    {isNonEmptyString(errorMessage) && <StyledError>{errorMessage}</StyledError>}
    {isNonEmptyString(hint) && <StyledHint>{hint}</StyledHint>}
  </StyledField>
);
