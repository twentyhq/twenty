import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { IconComponent } from 'twenty-ui/display';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4.5)};
  justify-content: center;
  position: relative;
  width: ${({ theme }) => theme.spacing(4.5)};
`;

const StyledObjectIconWrapper = styled.div<{ $backgroundColor: string }>`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledViewOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: 1px solid ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.xs};
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
};

export const ObjectIconWithViewOverlay = ({
  ObjectIcon,
  ViewIcon,
}: ObjectIconWithViewOverlayProps) => {
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);

  return (
    <StyledCompositeContainer>
      <StyledObjectIconWrapper $backgroundColor={iconColors.object}>
        <ObjectIcon
          size={theme.spacing(3.5)}
          stroke={theme.icon.stroke.md}
          color={theme.grayScale.gray1}
        />
      </StyledObjectIconWrapper>
      <StyledViewOverlay $backgroundColor={iconColors.view}>
        <ViewIcon
          size={theme.spacing(2)}
          stroke={theme.icon.stroke.sm}
          color={theme.grayScale.gray1}
        />
      </StyledViewOverlay>
    </StyledCompositeContainer>
  );
};
