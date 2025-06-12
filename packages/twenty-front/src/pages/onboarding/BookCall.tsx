import Cal from '@calcom/embed-react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconChevronRightPipe } from '@tabler/icons-react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/input';

const StyledCalWrapper = styled.div`
  place-content: center;
  height: 100%;
  width: 100%;
`;

const StyledFallbackContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledModalHeader = styled(Modal.Header)`
  height: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-bottom: 0;
  justify-content: flex-end;
`;

const StyledModalContent = styled(Modal.Content)`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const BookCall = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useRecoilValue(currentUserState);

  const handleCompleteOnboarding = () => {
    setNextOnboardingStatus();
  };

  return (
    <>
      <StyledModalHeader>
        <LightButton
          Icon={IconChevronRightPipe}
          title={t`Skip`}
          onClick={handleCompleteOnboarding}
        />
      </StyledModalHeader>
      <StyledModalContent isHorizontalCentered isVerticalCentered>
        {isDefined(calendarBookingPageId) ? (
          <StyledCalWrapper>
            <Cal
              calLink={calendarBookingPageId}
              config={{
                layout: 'month_view',
                theme: theme.name === 'light' ? 'light' : 'dark',
                email: currentUser?.email ?? '',
              }}
            />
          </StyledCalWrapper>
        ) : (
          <StyledFallbackContainer>
            <SubTitle>
              <Trans>
                Booking is not available at the moment. Please continue with the
                setup. You can book on{' '}
                <a href="https://twenty.com/Book-a-call">
                  https://twenty.com/Book-a-call
                </a>
              </Trans>
            </SubTitle>
          </StyledFallbackContainer>
        )}
      </StyledModalContent>
    </>
  );
};
