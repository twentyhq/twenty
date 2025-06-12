import Cal from '@calcom/embed-react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRightPipe } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';

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

const StyledModalFooter = styled(Modal.Footer)`
  height: auto;
  justify-content: center;
  overflow: visible;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-bottom: 0;
`;

const StyledModalContent = styled(Modal.Content)`
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledScrollArea = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  min-height: 0;
`;

// not sure about this, ie not code but do we want to hide the scrollbar?
// product review
const StyledScrollWrapper = styled(ScrollWrapper)`
  scrollbar-width: none;
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
      <StyledModalContent>
        <StyledScrollArea>
          {isDefined(calendarBookingPageId) ? (
            <StyledScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
              <Cal
                calLink={calendarBookingPageId}
                config={{
                  layout: 'month_view',
                  theme: theme.name === 'light' ? 'light' : 'dark',
                  email: currentUser?.email ?? '',
                }}
              />
            </StyledScrollWrapper>
          ) : (
            <StyledFallbackContainer>
              <SubTitle>
                <Trans>
                  Booking is not available at the moment. Please continue with
                  the setup. You can book on{' '}
                  <a href="https://twenty.com/Book-a-call">
                    https://twenty.com/Book-a-call
                  </a>
                </Trans>
              </SubTitle>
            </StyledFallbackContainer>
          )}
        </StyledScrollArea>
      </StyledModalContent>
      <StyledModalFooter>
        <LightButton
          Icon={IconChevronRightPipe}
          title={t`Skip`}
          onClick={handleCompleteOnboarding}
        />
      </StyledModalFooter>
    </>
  );
};
