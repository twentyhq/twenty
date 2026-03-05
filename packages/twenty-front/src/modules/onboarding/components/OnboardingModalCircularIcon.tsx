import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCheckContainer = styled.div<{ color: string }>`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-shadow: ${({ color }) => color && `-4px 4px 0 -2px ${color}`};
  height: 36px;
  width: 36px;
`;

type OnboardingModalCircularIconProps = {
  Icon: IconComponent;
};

export const OnboardingModalCircularIcon = ({
  Icon,
}: OnboardingModalCircularIconProps) => {
  const { theme } = useContext(ThemeContext);
  const color = theme.background.invertedPrimary;

  return (
    <StyledCheckContainer color={color}>
      <Icon size={24} color={color} stroke={3} />
    </StyledCheckContainer>
  );
};
