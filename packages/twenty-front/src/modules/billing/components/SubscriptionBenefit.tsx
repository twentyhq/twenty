import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { IconCheck } from 'twenty-ui/display';

const StyledBenefitContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
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
