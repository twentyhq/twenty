import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledCallRecordingCard = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.secondary};
  overflow: hidden;
  width: 100%;

  & > :not(:last-child) {
    border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  }
`;
