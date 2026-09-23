import { OnboardingHeader } from '@/onboarding/components/OnboardingHeader';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: calc(100dvh / var(--t-zoom, 1));
  width: 100%;
`;

type OnboardingLayoutProps = {
  children: ReactNode;
  onBack?: () => void;
  isBackDisabled?: boolean;
  headerRightComponent?: ReactNode;
};

export const OnboardingLayout = ({
  children,
  onBack,
  isBackDisabled,
  headerRightComponent,
}: OnboardingLayoutProps) => (
  <StyledBackground>
    <OnboardingHeader
      onBack={onBack}
      isBackDisabled={isBackDisabled}
      rightComponent={headerRightComponent}
    />
    {children}
  </StyledBackground>
);
