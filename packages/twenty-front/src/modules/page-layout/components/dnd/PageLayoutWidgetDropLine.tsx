import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropLine = styled.div`
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 2px;
  width: 100%;
`;

export const PageLayoutWidgetDropLine = () => <StyledDropLine />;
