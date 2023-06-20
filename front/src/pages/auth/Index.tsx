import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FooterNote } from '@/auth/components/FooterNote';
import { HorizontalSeparator } from '@/auth/components/HorizontalSeparator';
import { Logo } from '@/auth/components/Logo';
import { Modal } from '@/auth/components/Modal';
import { Title } from '@/auth/components/Title';
import { useMockData } from '@/auth/hooks/useMockData';
import { hasAccessToken } from '@/auth/services/AuthService';
import { PrimaryButton } from '@/ui/components/buttons/PrimaryButton';
import { SecondaryButton } from '@/ui/components/buttons/SecondaryButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { IconBrandGoogle } from '@/ui/icons';

import { Companies } from '../companies/Companies';

const StyledContentContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(8)};
  padding-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

export function Index() {
  const navigate = useNavigate();
  const theme = useTheme();
  useMockData();

  useEffect(() => {
    if (hasAccessToken()) {
      navigate('/');
    }
  }, [navigate]);

  const onGoogleLoginClick = useCallback(() => {
    navigate('/auth/login');
  }, [navigate]);

  return (
    <>
      <Companies />
      <Modal>
        <Logo />
        <Title title="Welcome to Twenty" />
        <StyledContentContainer>
          <PrimaryButton fullWidth={true} onClick={onGoogleLoginClick}>
            <IconBrandGoogle size={theme.iconSizeSmall} stroke={4} />
            Continue With Google
          </PrimaryButton>
          <HorizontalSeparator />
          <TextInput
            initialValue=""
            onChange={(value) => console.log(value)}
            fullWidth={true}
          />
          <SecondaryButton fullWidth={true}>Continue</SecondaryButton>
        </StyledContentContainer>
        <FooterNote>
          By using Twenty, you agree to the Terms of Service and Data Processing
          Agreement.
        </FooterNote>
      </Modal>
    </>
  );
}
