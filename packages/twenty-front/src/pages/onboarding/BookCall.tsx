import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { isNonEmptyString } from '@sniptt/guards';
import { Navigate } from 'react-router-dom';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { BookCallStepBody } from '@/onboarding/components/BookCallStepBody';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepPage } from '@/onboarding/components/StyledOnboardingStepPage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

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
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);

  if (!isNonEmptyString(calendarBookingPageId)) {
    return <Navigate to={AppPath.PlanRequired} replace />;
  }

  return (
    <StyledPage>
      <BookCallStepBody calendarBookingPageId={calendarBookingPageId} />

      <OnboardingStepAnimatedItem index={3}>
        <StyledFooter>
          <NavigationButton
            buttonComponent={LightButton}
            to={AppPath.PlanRequired}
            startIcon={<IconChevronLeft />}
          >{t`Back`}</NavigationButton>
        </StyledFooter>
      </OnboardingStepAnimatedItem>
    </StyledPage>
  );
};
