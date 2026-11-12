import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { isNonEmptyString } from '@sniptt/guards';
import { Navigate } from 'react-router-dom';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';
import { BookCallStepBody } from '@/onboarding/components/BookCallStepBody';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const StyledPage = styled(StyledOnboardingStepPage)`
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  }
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const BookCall = () => {
  const { t } = useLingui();
  const onboardingStatus = useOnboardingStatus();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);

  const isOnboardingStep = onboardingStatus === OnboardingStatus.BOOK_CALL;
  const hasBookingPage = isNonEmptyString(calendarBookingPageId);

  // Never redirect out of the step itself: the page-change effect routes
  // BOOK_CALL back here, so the two would bounce off each other.
  if (!hasBookingPage && !isOnboardingStep) {
    return <Navigate to={AppPath.PlanRequired} replace />;
  }

  return (
    <StyledPage>
      <BookCallStepBody calendarBookingPageId={calendarBookingPageId} />

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          {isOnboardingStep ? (
            <BookCallOnboardingStepActions />
          ) : (
            <NavigationButton
              buttonComponent={LightButton}
              to={AppPath.PlanRequired}
              startIcon={<IconChevronLeft />}
            >{t`Back`}</NavigationButton>
          )}
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledPage>
  );
};
