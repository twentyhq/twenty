import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClock, IconProgressCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AGENT_CHAT_THREAD_INBOX_EVENT_TIME_FORMAT } from '@/ai/constants/AgentChatThreadInboxEventTimeFormat';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledNotice = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

const formatEventTime = (date: string) =>
  AGENT_CHAT_THREAD_INBOX_EVENT_TIME_FORMAT.format(new Date(date));

// Ends the conversation with where the chat stands in the member's inbox
export const AiChatThreadInboxStateNotice = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { snoozedUntil, doneAt, snoozeEndedAt } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    { threadId: currentAiChatThread ?? '', lastActivityAt: null },
  );

  const notice = isDefined(snoozedUntil)
    ? {
        Icon: IconClock,
        text: t`Snoozed until ${formatEventTime(snoozedUntil)}`,
      }
    : isDefined(snoozeEndedAt)
      ? {
          Icon: IconClock,
          text: t`Snooze ended ${formatEventTime(snoozeEndedAt)}`,
        }
      : isDefined(doneAt)
        ? {
            Icon: IconProgressCheck,
            text: t`Marked as done ${formatEventTime(doneAt)}`,
          }
        : null;

  if (!isDefined(notice)) {
    return null;
  }

  return (
    <StyledNotice>
      <notice.Icon size={theme.icon.size.sm} />
      {notice.text}
    </StyledNotice>
  );
};
