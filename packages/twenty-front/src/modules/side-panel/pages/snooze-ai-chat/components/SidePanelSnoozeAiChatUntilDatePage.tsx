import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  width: fit-content;
`;

export const SidePanelSnoozeAiChatUntilDatePage = () => {
  const { t } = useLingui();
  const snoozeAiChatThreadId = useAtomComponentStateValue(
    snoozeAiChatThreadIdComponentState,
  );
  const { snoozeAgentChatThread } = useAgentChatThreadParticipants();
  const { formatAgentChatThreadDateTime } = useFormatAgentChatThreadDate();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { userTimezone } = useUserTimezone();
  // Starts on tomorrow morning, like the Tomorrow option
  const [snoozedUntil, setSnoozedUntil] = useState(() =>
    Temporal.Now.plainDateISO(userTimezone)
      .add({ days: 1 })
      .toZonedDateTime({
        timeZone: userTimezone,
        plainTime: Temporal.PlainTime.from('09:00'),
      }),
  );

  if (!isDefined(snoozeAiChatThreadId)) {
    return null;
  }

  const snoozedUntilDate = new Date(snoozedUntil.epochMilliseconds);
  const isInFuture = snoozedUntilDate > new Date();
  const snoozedUntilLabel = formatAgentChatThreadDateTime(snoozedUntilDate);

  const handleChange = (date: Temporal.ZonedDateTime | null) => {
    if (isDefined(date)) {
      setSnoozedUntil(date);
    }
  };

  const handleSnooze = () => {
    if (snoozedUntilDate <= new Date()) {
      return;
    }

    void closeSidePanelMenu();
    void snoozeAgentChatThread({
      threadId: snoozeAiChatThreadId,
      snoozedUntil: snoozedUntilDate,
    });
  };

  return (
    <StyledContainer>
      <DateTimePicker
        instanceId={`snooze-ai-chat-until-date-${snoozeAiChatThreadId}`}
        date={snoozedUntil}
        onChange={handleChange}
        clearable={false}
        hideHeaderInput
        timeZone={userTimezone}
      />
      <Button
        variant="solid"
        color="accent"
        size="sm"
        fullWidth
        disabled={!isInFuture}
        onClick={handleSnooze}
      >
        {isInFuture
          ? t`Snooze until ${snoozedUntilLabel}`
          : t`Pick a time in the future`}
      </Button>
    </StyledContainer>
  );
};
