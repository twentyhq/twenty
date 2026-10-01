import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClock } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AGENT_CHAT_THREAD_SNOOZE_TIME_FORMAT } from '@/ai/constants/AgentChatThreadSnoozeTimeFormat';
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

export const AiChatThreadSnoozedNotice = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { snoozedUntil } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    { threadId: currentAiChatThread ?? '', lastActivityAt: null },
  );

  if (!isDefined(snoozedUntil)) {
    return null;
  }

  const snoozedUntilLabel = AGENT_CHAT_THREAD_SNOOZE_TIME_FORMAT.format(
    new Date(snoozedUntil),
  );

  return (
    <StyledNotice>
      <IconClock size={theme.icon.size.sm} />
      {t`Snoozed until ${snoozedUntilLabel}`}
    </StyledNotice>
  );
};
