import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  justify-content: center;
  position: relative;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: -5px;
  display: flex;
  height: 14px;
  justify-content: center;
  position: absolute;
  right: -6px;
  width: 12px;
`;

type NavigationMenuItemIconWithOverlayProps = {
  children: ReactNode;
  OverlayIcon: IconComponent;
};

export const NavigationMenuItemIconWithOverlay = ({
  children,
  OverlayIcon,
}: NavigationMenuItemIconWithOverlayProps) => {
  const theme = useTheme();

  return (
    <StyledCompositeContainer>
      {children}
      <StyledOverlay $backgroundColor={themeCssVariables.grayScale.gray4}>
        <OverlayIcon
          size="12px"
          stroke={theme.icon.stroke.md}
          color={themeCssVariables.grayScale.gray10}
        />
      </StyledOverlay>
    </StyledCompositeContainer>
  );
};
