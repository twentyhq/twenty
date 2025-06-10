import Cal from '@calcom/embed-react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { AppPath } from '@/types/AppPath';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';

const StyledModalContent = styled(Modal.Content)`
  padding: 0;
`;

const StyledCalWrapper = styled.div`
  flex: 1;
  width: 100%;
  margin: 0 -${({ theme }) => theme.spacing(16)};
  min-height: 460px;
`;

const StyledFooter = styled(Modal.Footer)`
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BookCall = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email');

  return (
    <>
      <StyledModalContent isHorizontalCentered isVerticalCentered>
        {isDefined(calendarBookingPageId) ? (
          <StyledCalWrapper>
            <Cal
              calLink={calendarBookingPageId}
              config={{
                layout: 'month_view',
                theme: theme.name === 'light' ? 'light' : 'dark',
                email: email ?? '',
              }}
            />
          </StyledCalWrapper>
        ) : (
          <SubTitle>
            <Trans>
              Booking is not available at the moment. Please continue with the
              setup. You can book on{' '}
              <a href="https://twenty.com/Book-a-call">
                https://twenty.com/Book-a-call
              </a>
            </Trans>
          </SubTitle>
        )}
      </StyledModalContent>
      <StyledFooter>
        <Button
          title={t`Continue with workspace creation`}
          to={AppPath.CreateWorkspace}
          variant="primary"
          size="medium"
        />
      </StyledFooter>
    </>
  );
};
