import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/display';

const StyledCheckContainer = styled.div<{ color: string }>`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${({ color }) => color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
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
  const theme = useTheme();
  const color = theme.background.invertedPrimary;

  return (
    <StyledCheckContainer color={color}>
      <Icon size={24} color={color} stroke={3} />
    </StyledCheckContainer>
  );
};
