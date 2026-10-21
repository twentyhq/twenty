import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledActivityTime = styled.div`
  flex-shrink: 0;
`;

type AiChatThreadActivityTimeProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadActivityTime = ({
  thread,
}: AiChatThreadActivityTimeProps) => {
  const { t } = useLingui();
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);
  const { event } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    thread.id,
  );
  const { formatAgentChatThreadDay } = useFormatAgentChatThreadDate();

  const getActivityTimeLabel = () => {
    switch (event?.type) {
      case 'SNOOZED': {
        const snoozedUntilDay = formatAgentChatThreadDay(new Date(event.at));

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
          getAgentChatThreadLastActivityAt(thread),
        );
    }
  };

  return (
    <Text
      render={<StyledActivityTime />}
      size="sm"
      color={isUnread ? 'primary' : 'tertiary'}
    >
      {getActivityTimeLabel()}
    </Text>
  );
};
