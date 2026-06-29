import { SubTitle } from '@/auth/components/SubTitle';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';
import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const VerifyV2 = () => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <VerifyLoginTokenEffect />
      <OnboardingPulsingLogo />
      <SubTitle>{t`Verifying your email`}</SubTitle>
    </StyledContainer>
  );
};
