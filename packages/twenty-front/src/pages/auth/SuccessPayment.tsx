import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle.tsx';
import { Title } from '@/auth/components/Title.tsx';
import { AppPath } from '@/types/AppPath.ts';
import { IconCheck } from '@/ui/display/icon';
import { LargeMainButton } from '@/ui/input/button/components/LargeMainButton.tsx';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn.tsx';

const StyledCheckContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.border.color.dark};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${({ theme }) => theme.boxShadow.dark};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SuccessPayment = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const handleButtonClick = () => {
    navigate(AppPath.CreateWorkspace);
  };
  return (
    <>
      <AnimatedEaseIn>
        <StyledCheckContainer>
          <IconCheck color={theme.grayScale.gray90} size={24} stroke={3} />
        </StyledCheckContainer>
      </AnimatedEaseIn>
      <Title>All set!</Title>
      <SubTitle>Your account has been activated.</SubTitle>
      <LargeMainButton title="Start" onClick={handleButtonClick} />
    </>
  );
};
