import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconX } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { AnimatedFadeOut } from '@/ui/utilities/animation/components/AnimatedFadeOut';
import { cookieStorage } from '~/utils/cookie-storage';

import CoverImage from '../assets/build-your-business-logic.jpg';

const StyledCoverImageContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledCoverImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
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
        <StyledCoverImage src={CoverImage} alt="Build your business logic" />
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
