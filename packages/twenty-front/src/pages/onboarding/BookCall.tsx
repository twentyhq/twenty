import Cal from '@calcom/embed-react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/input';

const StyledBorderedContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledScrollableContent = styled.div`
  flex: 1;
  min-height: 0;
`;

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

const StyledFooter = styled.div`
  align-items: center;
  /* background: ${({ theme }) => theme.background.primary}; */
  /* border-top: 1px solid ${({ theme }) => theme.border.color.light}; */
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)} 0;
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
    <StyledBorderedContainer>
      <StyledScrollableContent>
        <ScrollWrapper componentInstanceId="book-call-scroll-wrapper">
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
                  Booking is not available at the moment. Please continue with
                  the setup. You can book on{' '}
                  <a href="https://twenty.com/Book-a-call">
                    https://twenty.com/Book-a-call
                  </a>
                </Trans>
              </SubTitle>
            </StyledFallbackContainer>
          )}
        </ScrollWrapper>
      </StyledScrollableContent>

      <StyledFooter>
        <MainButton
          title={t`Complete setup`}
          onClick={handleCompleteOnboarding}
          variant="primary"
          width={198}
        />
      </StyledFooter>
    </StyledBorderedContainer>
  );
};
