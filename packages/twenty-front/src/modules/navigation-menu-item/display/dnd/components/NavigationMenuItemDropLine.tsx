import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledDropLine = styled.div`
  background-color: ${themeCssVariables.color.blue};
  height: 2px;
  left: 0;
  position: absolute;
  width: 100%;

  &[data-position='top'] {
    border-radius: 0 0 ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm};
    top: 0;
  }

  &[data-position='bottom'] {
    border-radius: ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm} 0 0;
    bottom: 0;
  }
`;

type NavigationMenuItemDropLineProps = {
  position: 'top' | 'bottom';
};

export const NavigationMenuItemDropLine = ({
  position,
}: NavigationMenuItemDropLineProps) => (
  <StyledDropLine data-position={position} />
);
