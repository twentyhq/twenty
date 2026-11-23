import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

type TeamsUserLinkFormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
};

export const TeamsUserLinkFormField = ({
  label,
  htmlFor,
  children,
  hint,
}: TeamsUserLinkFormFieldProps) => (
  <StyledField>
    <StyledLabel htmlFor={htmlFor}>{label}</StyledLabel>
    {children}
    {hint}
  </StyledField>
);
