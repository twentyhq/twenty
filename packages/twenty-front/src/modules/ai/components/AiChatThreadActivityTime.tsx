import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { useIsAiChatThreadShownAsUnread } from '@/ai/hooks/useIsAiChatThreadShownAsUnread';
import { useFormatAiChatThreadDate } from '@/ai/hooks/useFormatAiChatThreadDate';
import { aiChatThreadMemberStateFamilySelector } from '@/ai/states/selectors/aiChatThreadMemberStateFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { type AiChatThreadRowVariant } from '@/ai/types/AiChatThreadRowVariant';
import { getAiChatThreadLastActivityAt } from '@/ai/utils/getAiChatThreadLastActivityAt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledActivityTime = styled.div`
  flex-shrink: 0;
`;

type AiChatThreadActivityTimeProps = {
  thread: AiChatThreadRecord;
  variant?: AiChatThreadRowVariant;
};

export const AiChatThreadActivityTime = ({
  thread,
  variant = 'default',
}: AiChatThreadActivityTimeProps) => {
  const { t } = useLingui();
  const isUnread = useIsAiChatThreadShownAsUnread(thread);
  const { event } = useAtomFamilySelectorValue(
    aiChatThreadMemberStateFamilySelector,
    thread.id,
  );
  const { formatAiChatThreadDay } = useFormatAiChatThreadDate();

  const getActivityTimeLabel = () => {
    switch (event?.type) {
      case 'SNOOZED': {
        const snoozedUntilDay = formatAiChatThreadDay(new Date(event.at));

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
          getAiChatThreadLastActivityAt(thread),
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
