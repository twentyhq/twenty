import Cal from '@calcom/embed-react';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft, IconChevronRightPipe } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  OnboardingStatus,
  useSkipBookOnboardingStepMutation,
} from '~/generated-metadata/graphql';

const StyledModalFooter = styled(Modal.Footer)`
  height: auto;
  justify-content: center;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledModalContent = styled(Modal.Content)`
  overflow: hidden;
  padding: 0;
`;

export const BookCall = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useAtomStateValue(currentUserState);
  const [skipBookOnboardingStepMutation] = useSkipBookOnboardingStepMutation();

  const isMobile = useIsMobile();
  const isPlanRequired =
    currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED;

  const handleCompleteOnboarding = async () => {
    await skipBookOnboardingStepMutation();
    setNextOnboardingStatus();
  };

  return (
    <>
      <StyledModalContent isHorizontalCentered isVerticalCentered>
        <ScrollWrapper
          componentInstanceId="scroll-wrapper-modal-content"
          autoHeight={!isMobile}
        >
          <Cal
            calLink={calendarBookingPageId ?? ''}
            config={{
              layout: 'month_view',
              theme: theme.name === 'light' ? 'light' : 'dark',
              email: currentUser?.email ?? '',
              name: `${currentUser?.firstName} ${currentUser?.lastName}`,
            }}
          />
        </ScrollWrapper>
      </StyledModalContent>
      <StyledModalFooter>
        {isPlanRequired ? (
          <Link to={AppPath.PlanRequired}>
            <LightButton Icon={IconChevronLeft} title={t`Back`} />
          </Link>
        ) : (
          <LightButton
            Icon={IconChevronRightPipe}
            title={t`Skip`}
            onClick={handleCompleteOnboarding}
          />
        )}
      </StyledModalFooter>
    </>
  );
};
