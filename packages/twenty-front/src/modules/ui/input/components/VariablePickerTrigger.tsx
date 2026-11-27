import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledVariablePickerTrigger = styled.div<{
  disabled?: boolean;
}>`
  align-items: center;
  border-bottom-right-radius: ${themeCssVariables.border.radius.md};
  border-top-right-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  user-select: none;
`;

export { StyledVariablePickerTrigger as VariablePickerTrigger };
