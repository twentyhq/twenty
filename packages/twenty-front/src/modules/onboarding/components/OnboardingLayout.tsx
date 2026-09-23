import { OnboardingHeader } from '@/onboarding/components/OnboardingHeader';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { ONBOARDING_SIDE_COMPONENT_MIN_VIEWPORT_WIDTH } from '@/onboarding/constants/OnboardingSideComponentMinViewportWidth';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: calc(100dvh / var(--t-zoom, 1));
  position: relative;
  width: 100%;
`;

const StyledSide = styled.div`
  bottom: ${themeCssVariables.spacing[8]};
  display: none;
  left: calc(
    50% + ${ONBOARDING_CONTENT_BLOCK_WIDTH / 2}px +
      ${themeCssVariables.spacing[12]}
  );
  pointer-events: none;
  position: absolute;
  right: ${themeCssVariables.spacing[8]};
  top: ${themeCssVariables.spacing[16]};

  @media (min-width: ${ONBOARDING_SIDE_COMPONENT_MIN_VIEWPORT_WIDTH}px) {
    display: block;
  }
`;

type OnboardingLayoutProps = {
  children: ReactNode;
  onBack?: () => void;
  isBackDisabled?: boolean;
  headerRightComponent?: ReactNode;
  sideComponent?: ReactNode;
};

export const OnboardingLayout = ({
  children,
  onBack,
  isBackDisabled,
  headerRightComponent,
  sideComponent,
}: OnboardingLayoutProps) => (
  <StyledBackground>
    <OnboardingHeader
      onBack={onBack}
      isBackDisabled={isBackDisabled}
      rightComponent={headerRightComponent}
    />
    {children}
    {isDefined(sideComponent) && <StyledSide>{sideComponent}</StyledSide>}
  </StyledBackground>
);
