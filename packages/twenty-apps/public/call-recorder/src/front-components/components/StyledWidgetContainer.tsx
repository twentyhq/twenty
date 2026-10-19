import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledWidgetContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[1]};
  width: 100%;
`;
