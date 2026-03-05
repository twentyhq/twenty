import { styled } from '@linaria/react';
import React from 'react';
import { IconCheck } from 'twenty-ui/display';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';

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
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;
type SubscriptionBenefitProps = {
  children: React.ReactNode;
};
export const SubscriptionBenefit = ({ children }: SubscriptionBenefitProps) => {
  return (
    <StyledBenefitContainer>
      <StyledCheckContainer>
        <IconCheck
          color={resolveThemeVariable(themeCssVariables.grayScale.gray11)}
          size={14}
        />
      </StyledCheckContainer>
      {children}
    </StyledBenefitContainer>
  );
};
