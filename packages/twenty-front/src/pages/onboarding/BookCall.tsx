import Cal from '@calcom/embed-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { ModalContent, ModalFooter } from 'twenty-ui/layout';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft, IconChevronRightPipe } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  OnboardingStatus,
  useSkipBookOnboardingStepMutation,
} from '~/generated-metadata/graphql';

export const BookCall = () => {
  const { colorScheme } = useContext(ThemeContext);

  const { t } = useLingui();
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
      <ModalContent
        noPadding
        overflowHidden
        isHorizontallyCentered
        isVerticallyCentered
      >
        <ScrollWrapper
          componentInstanceId="scroll-wrapper-modal-content"
          autoHeight={!isMobile}
        >
          <Cal
            calLink={calendarBookingPageId ?? ''}
            config={{
              layout: 'month_view',
              theme: colorScheme === 'light' ? 'light' : 'dark',
              email: currentUser?.email ?? '',
              name: `${currentUser?.firstName} ${currentUser?.lastName}`,
            }}
          />
        </ScrollWrapper>
      </ModalContent>
      <ModalFooter autoHeight centered smallPadding>
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
      </ModalFooter>
    </>
  );
};
