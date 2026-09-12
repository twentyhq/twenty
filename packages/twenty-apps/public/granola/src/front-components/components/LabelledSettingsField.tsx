import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
`;

// twenty-front hard-codes this size in FieldLabel.module.scss; there is no token.
const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: 11px;
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

const StyledHint = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin-top: ${() => themeCssVariables.spacing[3]};
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
    {isNonEmptyString(errorMessage) && (
      <StyledSettingsError>{errorMessage}</StyledSettingsError>
    )}
    {isNonEmptyString(hint) && <StyledHint>{hint}</StyledHint>}
  </StyledField>
);
