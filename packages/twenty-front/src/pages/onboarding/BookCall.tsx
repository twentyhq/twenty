import { isNonEmptyString } from '@sniptt/guards';
import { Link, Navigate } from 'react-router-dom';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { BookCallEmbed } from '@/onboarding/components/BookCallEmbed';
import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const StyledPage = styled(StyledOnboardingStepPage)`
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
  }
`;

const StyledEmbed = styled(OnboardingStepAnimatedItem)`
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  width: 100%;
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
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Talk to our team`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`Book a 30-minute call and we'll help you get your workspace production-ready.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      {hasBookingPage && (
        <StyledEmbed index={2}>
          <BookCallEmbed calendarBookingPageId={calendarBookingPageId} />
        </StyledEmbed>
      )}

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          {isOnboardingStep ? (
            <BookCallOnboardingStepActions />
          ) : (
            <Link to={AppPath.PlanRequired}>
              <LightButton Icon={IconChevronLeft} title={t`Back`} />
            </Link>
          )}
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledPage>
  );
};
