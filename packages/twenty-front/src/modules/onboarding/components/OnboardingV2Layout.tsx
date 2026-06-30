import { OnboardingV2Header } from '@/onboarding/components/OnboardingV2Header';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
`;

type OnboardingV2LayoutProps = {
  children: ReactNode;
  onBack?: () => void;
  freeCredits?: number;
};

export const OnboardingV2Layout = ({
  children,
  onBack,
  freeCredits,
}: OnboardingV2LayoutProps) => (
  <StyledBackground>
    <OnboardingV2Header onBack={onBack} freeCredits={freeCredits} />
    {children}
  </StyledBackground>
);
