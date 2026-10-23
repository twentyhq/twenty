import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import { useSnoozeAiChatThreads } from '@/side-panel/pages/snooze-ai-chat/hooks/useSnoozeAiChatThreads';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  width: fit-content;
`;

type SnoozeAiChatUntilDatePickerProps = {
  threadIds: string[];
  onSnoozed: () => void;
};

export const SnoozeAiChatUntilDatePicker = ({
  threadIds,
  onSnoozed,
}: SnoozeAiChatUntilDatePickerProps) => {
  const { t } = useLingui();
  const { snoozeAiChatThreads } = useSnoozeAiChatThreads();
  const { formatAgentChatThreadDateTime } = useFormatAgentChatThreadDate();
  const { userTimezone } = useUserTimezone();
  const dateTimePickerInstanceId = useId();
  // Starts on tomorrow morning, like the Tomorrow option
  const [snoozedUntil, setSnoozedUntil] = useState(() =>
    Temporal.Now.plainDateISO(userTimezone)
      .add({ days: 1 })
      .toZonedDateTime({
        timeZone: userTimezone,
        plainTime: Temporal.PlainTime.from('09:00'),
      }),
  );

  // Read on each interaction rather than on a clock, so a picked time that
  // passes while the picker is open shows as past once it is used
  const [checkedAt, setCheckedAt] = useState(() => Date.now());

  const snoozedUntilDate = new Date(snoozedUntil.epochMilliseconds);
  const isInFuture = snoozedUntil.epochMilliseconds > checkedAt;
  const snoozedUntilLabel = formatAgentChatThreadDateTime(snoozedUntilDate);

  const handleChange = (date: Temporal.ZonedDateTime | null) => {
    if (isDefined(date)) {
      setSnoozedUntil(date);
      setCheckedAt(Date.now());
    }
  };

  const handleSnooze = () => {
    const now = Date.now();

    if (snoozedUntil.epochMilliseconds <= now) {
      setCheckedAt(now);
      return;
    }

    onSnoozed();
    void snoozeAiChatThreads({ threadIds, snoozedUntil: snoozedUntilDate });
  };

  return (
    <StyledContainer>
      <DateTimePicker
        instanceId={dateTimePickerInstanceId}
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
