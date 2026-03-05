import { styled } from '@linaria/react';
import type { IconComponent } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/get-navigation-menu-item-icon-style-from-color';

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  position: relative;
  width: 16px;
`;

const StyledObjectIconWrapper = styled.div<{
  $backgroundColor: string;
  $borderColor?: string;
}>`
  position: absolute;
  inset: 0;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${({ $borderColor }) =>
    $borderColor ? `1px solid ${$borderColor}` : 'none'};
`;

const StyledViewOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 4px;
  bottom: -7px;
  display: flex;
  height: 14px;
  justify-content: center;
  position: absolute;
  right: -7px;
  width: 14px;
`;

export type ObjectIconWithViewOverlayProps = {
  ObjectIcon: IconComponent;
  ViewIcon: IconComponent;
  objectColor?: string | null;
};

export const ObjectIconWithViewOverlay = ({
  ObjectIcon,
  ViewIcon,
  objectColor,
}: ObjectIconWithViewOverlayProps) => {
  const { theme } = useContext(ThemeContext);
  const objectStyle = getNavigationMenuItemIconStyleFromColor(objectColor);

  return (
    <StyledCompositeContainer>
      <StyledObjectIconWrapper
        $backgroundColor={objectStyle.backgroundColor}
        $borderColor={objectStyle.borderColor}
      >
        <ObjectIcon
          size="14px"
          stroke={theme.icon.stroke.md}
          color={objectStyle.iconColor}
        />
      </StyledObjectIconWrapper>
      <StyledViewOverlay $backgroundColor={themeCssVariables.grayScale.gray4}>
        <ViewIcon
          size="10px"
          stroke={theme.icon.stroke.lg}
          color={themeCssVariables.grayScale.gray10}
        />
      </StyledViewOverlay>
    </StyledCompositeContainer>
  );
};
