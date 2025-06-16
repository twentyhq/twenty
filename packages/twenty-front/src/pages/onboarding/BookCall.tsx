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
import { useSkipBookOnboardingStepMutation } from '~/generated/graphql';

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
  padding: 0;
`;

const StyledScrollArea = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  min-height: 0;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  scrollbar-width: none;
`;

// I dont like this at all, becuase then its not responsive to different screen sizes
// but I dont know how to fix it
// I think we should just use the iframe and not the embed react component
// get back to this
const StyledCalWrapper = styled.div`
  min-height: 600px;
  place-content: center;
`;

export const BookCall = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentUser = useRecoilValue(currentUserState);
  const [skipBookOnboardingStepMutation] = useSkipBookOnboardingStepMutation();

  const handleCompleteOnboarding = async () => {
    await skipBookOnboardingStepMutation();
    setNextOnboardingStatus();
  };

  return (
    <>
      <StyledModalContent>
        <StyledScrollArea>
          {isDefined(calendarBookingPageId) ? (
            <StyledScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
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
