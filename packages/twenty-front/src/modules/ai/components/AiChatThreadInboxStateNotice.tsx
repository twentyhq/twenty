import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClock, IconProgressCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
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

// Ends the conversation with where the chat stands in the member's inbox
export const AiChatThreadInboxStateNotice = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatAgentChatThreadDateTime } = useFormatAgentChatThreadDate();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { event } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    currentAiChatThread ?? '',
  );

  if (!isDefined(event)) {
    return null;
  }

  const eventTime = formatAgentChatThreadDateTime(new Date(event.at));
  const notice = {
    SNOOZED: { Icon: IconClock, text: t`Snoozed until ${eventTime}` },
    SNOOZE_ENDED: { Icon: IconClock, text: t`Snooze ended ${eventTime}` },
    DONE: { Icon: IconProgressCheck, text: t`Marked as done ${eventTime}` },
  }[event.type];

  return (
    <StyledNotice>
      <notice.Icon size={theme.icon.size.sm} />
      {notice.text}
    </StyledNotice>
  );
};
