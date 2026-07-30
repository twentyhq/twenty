import Cal from '@calcom/embed-react';
import { isNonEmptyString } from '@sniptt/guards';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useThemeColorScheme } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

export const BookCallEmbed = () => {
  const colorScheme = useThemeColorScheme();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isMobile = useIsMobile();

  const attendeeName = [
    currentWorkspaceMember?.name?.firstName ?? currentUser?.firstName,
    currentWorkspaceMember?.name?.lastName ?? currentUser?.lastName,
  ]
    .filter(isNonEmptyString)
    .join(' ');

  if (!isNonEmptyString(calendarBookingPageId)) {
    return null;
  }

  return (
    <ScrollWrapper
      componentInstanceId="scroll-wrapper-book-call"
      autoHeight={!isMobile}
    >
      <Cal
        calLink={calendarBookingPageId}
        config={{
          layout: 'month_view',
          theme: colorScheme,
          email: currentUser?.email ?? '',
          name: attendeeName,
        }}
      />
    </ScrollWrapper>
  );
};
