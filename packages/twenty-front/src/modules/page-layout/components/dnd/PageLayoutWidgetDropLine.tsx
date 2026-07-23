import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Absolutely positioned in the gap above its (position: relative) parent so
// activating the drop target does not reflow the list.
const StyledDropLineContainer = styled.div`
  left: 0;
  position: absolute;
  right: 0;
  top: calc(-1 * ${themeCssVariables.spacing[2]});
`;

const StyledDropLine = styled.div`
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 2px;
  width: 100%;
`;

export const PageLayoutWidgetDropLine = () => (
  <StyledDropLineContainer>
    <StyledDropLine />
  </StyledDropLineContainer>
);
