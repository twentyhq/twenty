import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledSettingsCard = styled.div`
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.secondary};
  width: 100%;

  & > :first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  & > :last-child {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
`;
