import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Mirrors twenty-ui's Card without its overflow: hidden, which would clip the
// select menus that open inline below their rows. The rows paint their own
// background, so the first and last ones take over the card's corners.
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
