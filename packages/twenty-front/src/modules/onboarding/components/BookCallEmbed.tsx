import Cal from '@calcom/embed-react';
import { useContext } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

export const BookCallEmbed = () => {
  const { colorScheme } = useContext(ThemeContext);
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentUser = useAtomStateValue(currentUserState);
  const isMobile = useIsMobile();

  return (
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
  );
};
