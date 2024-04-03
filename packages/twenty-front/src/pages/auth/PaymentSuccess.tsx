import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck } from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle.tsx';
import { Title } from '@/auth/components/Title.tsx';
import { AppPath } from '@/types/AppPath.ts';
import { MainButton } from '@/ui/input/button/components/MainButton.tsx';
import { RGBA } from '@/ui/theme/constants/Rgba.ts';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn.tsx';

const StyledCheckContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const handleButtonClick = () => {
    navigate(AppPath.CreateWorkspace);
  };
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;
  return (
    <>
      <AnimatedEaseIn>
        <StyledCheckContainer color={color}>
          <IconCheck color={color} size={24} stroke={3} />
        </StyledCheckContainer>
      </AnimatedEaseIn>
      <Title>All set!</Title>
      <SubTitle>Your account has been activated.</SubTitle>
      <StyledButtonContainer>
        <MainButton title="Start" onClick={handleButtonClick} width={200} />
      </StyledButtonContainer>
    </>
  );
};
