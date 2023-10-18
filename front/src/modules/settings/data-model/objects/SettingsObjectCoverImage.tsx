import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';

import { IconX } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { cookieStorage } from '~/utils/cookie-storage';

import CoverImage from '../assets/build-your-business-logic.jpg';

type AnimateImageProps = {
  children: React.ReactNode;
};

const AnimateImage = ({ children }: AnimateImageProps) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 1, marginBottom: theme.spacing(8) }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const StyledCoverImageContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 153px;
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
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsObjectCoverImage = () => {
  const [cookieState, setCookieState] = useState(
    cookieStorage.getItem('settings-object-cover-image'),
  );

  return (
    <AnimatePresence>
      {cookieState !== 'closed' && (
        <AnimateImage>
          <StyledCoverImageContainer>
            <StyledCoverImage
              src={CoverImage}
              alt="Build your business logic"
            />
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
        </AnimateImage>
      )}
    </AnimatePresence>
  );
};
