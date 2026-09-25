import { styled } from '@linaria/react';
import React from 'react';
import { IconCheck } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledBenefitContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCheckContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: 50%;
  corner-shape: round;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;
type SubscriptionBenefitProps = {
  children: React.ReactNode;
};
export const SubscriptionBenefit = ({ children }: SubscriptionBenefitProps) => {
  const theme = useTheme();

  return (
    <StyledBenefitContainer>
      <StyledCheckContainer>
        <IconCheck color={theme.grayScale.gray11} size={14} />
      </StyledCheckContainer>
      {children}
    </StyledBenefitContainer>
  );
};
