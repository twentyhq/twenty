import Cal from '@calcom/embed-react';
import { isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAttendeeName } from '@/onboarding/utils/getAttendeeName';
import { useThemeColorScheme } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

type BookCallEmbedProps = {
  calendarBookingPageId: string;
};

export const BookCallEmbed = ({
  calendarBookingPageId,
}: BookCallEmbedProps) => {
  const colorScheme = useThemeColorScheme();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isMobile = useIsMobile();

  const attendeeName = isDefined(currentWorkspaceMember?.name)
    ? getAttendeeName(currentWorkspaceMember.name)
    : getAttendeeName(currentUser);

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
