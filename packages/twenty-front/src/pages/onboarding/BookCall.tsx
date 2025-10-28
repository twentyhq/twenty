import Cal from '@calcom/embed-react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft, IconChevronRightPipe } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  OnboardingStatus,
  useSkipBookOnboardingStepMutation,
} from '~/generated-metadata/graphql';

const StyledModalFooter = styled(Modal.Footer)`
  height: auto;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledModalContent = styled(Modal.Content)`
  overflow: hidden;
  padding: 0;
`;

const StyledScrollWrapper = styled(ScrollWrapper)<{ isMobile: boolean }>`
  ${({ isMobile }) => !isMobile && 'height: auto;'}
`;

export const BookCall = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useRecoilValue(currentUserState);
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
        <StyledScrollWrapper
          componentInstanceId="scroll-wrapper-modal-content"
          isMobile={isMobile}
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
        </StyledScrollWrapper>
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
