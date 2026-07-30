import Cal from '@calcom/embed-react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

export const BookCallEmbed = () => {
  const { colorScheme } = useContext(ThemeContext);
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isMobile = useIsMobile();

  // The workspace member holds the name entered at the profile step, which the user
  // has necessarily been through by now. currentUser only ever carries the name given
  // at sign-up, so it is empty for anyone who signed up with an email and password.
  const attendeeName = [
    currentWorkspaceMember?.name?.firstName ?? currentUser?.firstName,
    currentWorkspaceMember?.name?.lastName ?? currentUser?.lastName,
  ]
    .filter(isNonEmptyString)
    .join(' ');

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
          name: attendeeName,
        }}
      />
    </ScrollWrapper>
  );
};
