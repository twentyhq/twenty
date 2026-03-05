import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledInputHint = styled.div<{
  danger?: boolean;
}>`
  color: ${({ danger }) =>
    danger
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-top: ${themeCssVariables.spacing[0.5]};
`;

export { StyledInputHint as InputHint };
