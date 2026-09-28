import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledCheckContainer = styled.div<{ color: string }>`
  align-items: center;
  border: 2px solid ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-shadow: ${({ color }) => color && `-4px 4px 0 -2px ${color}`};
  box-sizing: content-box;
  corner-shape: round;
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

type OnboardingModalCircularIconProps = {
  Icon: IconComponent;
};

export const OnboardingModalCircularIcon = ({
  Icon,
}: OnboardingModalCircularIconProps) => {
  const theme = useTheme();
  const color = theme.background.invertedPrimary;

  return (
    <StyledCheckContainer color={color}>
      <Icon size={24} color={color} stroke={3} />
    </StyledCheckContainer>
  );
};
