import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { useIsInboxThreadShownAsUnread } from '@/ai/hooks/useIsInboxThreadShownAsUnread';
import { useFormatInboxThreadDate } from '@/ai/hooks/useFormatInboxThreadDate';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/inboxThreadMemberStateFamilySelector';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { type InboxThreadListVariant } from '@/ai/types/InboxThreadListVariant';
import { getInboxThreadLastActivityAt } from '@/ai/utils/getInboxThreadLastActivityAt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledActivityTime = styled.div`
  flex-shrink: 0;
`;

type InboxThreadActivityTimeProps = {
  thread: InboxThreadRecord;
  variant?: InboxThreadListVariant;
};

export const InboxThreadActivityTime = ({
  thread,
  variant = 'default',
}: InboxThreadActivityTimeProps) => {
  const { t } = useLingui();
  const isUnread = useIsInboxThreadShownAsUnread(thread);
  const { event } = useAtomFamilySelectorValue(
    inboxThreadMemberStateFamilySelector,
    thread.id,
  );
  const { formatInboxThreadDay } = useFormatInboxThreadDate();

  const getActivityTimeLabel = () => {
    switch (event?.type) {
      case 'SNOOZED': {
        const snoozedUntilDay = formatInboxThreadDay(new Date(event.at));

        return t`Until ${snoozedUntilDay}`;
      }
      case 'SNOOZE_ENDED':
        return t`Snooze ended`;
      case 'DONE': {
        const doneTime = beautifyPastDateRelativeToNowShort(event.at);

        return t`Done ${doneTime}`;
      }
      case 'UNSUBSCRIBED': {
        const unsubscribedTime = beautifyPastDateRelativeToNowShort(event.at);

        return t`Unsubscribed ${unsubscribedTime}`;
      }
      default:
        return beautifyPastDateRelativeToNowShort(
          getInboxThreadLastActivityAt(thread),
        );
    }
  };

  const readActivityTimeColor =
    variant === 'compact' ? 'secondary' : 'tertiary';

  return (
    <Text
      render={<StyledActivityTime />}
      size={variant === 'compact' ? 'md' : 'sm'}
      color={isUnread ? 'primary' : readActivityTimeColor}
    >
      {getActivityTimeLabel()}
    </Text>
  );
};
