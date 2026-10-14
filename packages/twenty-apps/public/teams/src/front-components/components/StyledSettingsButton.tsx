import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledSettingsButton = styled.button`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[3]};
  width: fit-content;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;
