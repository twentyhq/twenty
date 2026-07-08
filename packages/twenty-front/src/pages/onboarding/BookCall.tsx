import Cal from '@calcom/embed-react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledContent = styled.div`
  align-items: center;
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
  const { colorScheme } = useContext(ThemeContext);

  const { t } = useLingui();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentUser = useAtomStateValue(currentUserState);

  const isMobile = useIsMobile();

  return (
    <StyledPage>
      <StyledContent>
        <ScrollWrapper
          componentInstanceId="scroll-wrapper-book-call"
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
      </StyledContent>
      <StyledFooter>
        <Link to={AppPath.PlanRequired}>
          <LightButton Icon={IconChevronLeft} title={t`Back`} />
        </Link>
      </StyledFooter>
    </StyledPage>
  );
};
