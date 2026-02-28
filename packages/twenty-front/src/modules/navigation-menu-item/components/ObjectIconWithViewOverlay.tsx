import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { IconComponent } from 'twenty-ui/display';

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
  ${({ $borderColor }) =>
    $borderColor ? `border: 1px solid ${$borderColor};` : ''}
`;

const StyledViewOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 4px;
  bottom: -7px;
  display: flex;
  height: ${({ theme }) => theme.spacing(3.5)};
  justify-content: center;
  position: absolute;
  right: -7px;
  width: ${({ theme }) => theme.spacing(3.5)};
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
  const theme = useTheme();
  const objectStyle = getNavigationMenuItemIconStyleFromColor(
    theme,
    objectColor,
  );

  return (
    <StyledCompositeContainer>
      <StyledObjectIconWrapper
        $backgroundColor={objectStyle.backgroundColor}
        $borderColor={objectStyle.borderColor}
      >
        <ObjectIcon
          size={theme.spacing(3.5)}
          stroke={theme.icon.stroke.md}
          color={objectStyle.iconColor}
        />
      </StyledObjectIconWrapper>
      <StyledViewOverlay $backgroundColor={theme.grayScale.gray4}>
        <ViewIcon
          size={theme.spacing(2.5)}
          stroke={theme.icon.stroke.lg}
          color={theme.grayScale.gray10}
        />
      </StyledViewOverlay>
    </StyledCompositeContainer>
  );
};
