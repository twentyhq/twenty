import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconX } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';
import { AnimatedFadeOut } from '@/ui/utilities/animation/components/AnimatedFadeOut';
import { cookieStorage } from '~/utils/cookie-storage';

import DarkCoverImage from '../assets/cover-dark.png';
import LightCoverImage from '../assets/cover-light.png';

const StyledCoverImageContainer = styled(Card)`
  align-items: center;
  background-image: ${({ theme }) =>
    theme.name === 'light'
      ? `url('${LightCoverImage.toString()}')`
      : `url('${DarkCoverImage.toString()}')`};
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  height: 153px;
  justify-content: center;
  position: relative;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledLighIconButton = styled(LightIconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectCoverImage = () => {
  const theme = useTheme();

  const [cookieState, setCookieState] = useState(
    cookieStorage.getItem('settings-object-cover-image'),
  );

  return (
    <AnimatedFadeOut
      isOpen={cookieState !== 'closed'}
      marginBottom={theme.spacing(8)}
    >
      <StyledCoverImageContainer>
        <StyledTitle>Build your business logic</StyledTitle>
        <StyledLighIconButton
          Icon={IconX}
          accent="tertiary"
          size="small"
          onClick={() => {
            cookieStorage.setItem('settings-object-cover-image', 'closed');
            setCookieState('closed');
          }}
        />
      </StyledCoverImageContainer>
    </AnimatedFadeOut>
  );
};
