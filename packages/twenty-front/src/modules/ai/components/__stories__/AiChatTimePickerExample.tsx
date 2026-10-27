import { styled } from '@linaria/react';
import { type ReactElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatTimePickerCard } from '@/ai/components/AiChatTimePickerCard';
import { AI_CHAT_TIME_PICKER_FIXTURE } from '@/ai/components/__stories__/aiChatTimePickerFixture';
import { type AiChatSchedulingAvailability } from '@/ai/types/AiChatSchedulingAvailability';
import { type AiChatSchedulingSelection } from '@/ai/types/AiChatSchedulingSelection';
import { TimeFormat } from '@/localization/constants/TimeFormat';

const StyledExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;
`;

type AiChatTimePickerExampleProps = {
  initialDate?: string | null;
  initialViewedMonth?: string;
  initialSelectedSlotId?: string | null;
  initialAvailability?: AiChatSchedulingAvailability;
  availabilityAfterRefresh?: AiChatSchedulingAvailability;
  uncheckedAttendees?: readonly string[];
  disabled?: boolean;
  isSending?: boolean;
  reviewFields?: ReactElement;
  timeZone?: string;
  locale?: string;
  timeFormat?: TimeFormat;
  onDateChange: (date: string) => void;
  onViewedMonthChange: (month: string) => void;
  onSlotChange: (slotId: string | null) => void;
  onSendInvite: (selection: AiChatSchedulingSelection) => void;
  onSkip: () => void;
  onRetry: () => void;
};

export const AiChatTimePickerExample = ({
  initialDate = AI_CHAT_TIME_PICKER_FIXTURE.date,
  initialViewedMonth = AI_CHAT_TIME_PICKER_FIXTURE.viewedMonth,
  initialSelectedSlotId = null,
  initialAvailability = AI_CHAT_TIME_PICKER_FIXTURE.availability,
  availabilityAfterRefresh,
  uncheckedAttendees,
  disabled,
  isSending,
  reviewFields,
  timeZone = AI_CHAT_TIME_PICKER_FIXTURE.timeZone,
  locale = 'en-US',
  timeFormat = TimeFormat.HOUR_24,
  onDateChange,
  onViewedMonthChange,
  onSlotChange,
  onSendInvite,
  onSkip,
  onRetry,
}: AiChatTimePickerExampleProps) => {
  const [date, setDate] = useState(initialDate);
  const [viewedMonth, setViewedMonth] = useState(initialViewedMonth);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSelectedSlotId);
  const [availability, setAvailability] = useState(initialAvailability);

  return (
    <StyledExample>
      <AiChatTimePickerCard
        title="Call with Patrick Collison · 30 min"
        hint="Invite goes to patrick@stripe.com with a meeting link"
        date={date}
        onDateChange={(nextDate) => {
          setDate(nextDate);
          onDateChange(nextDate);
        }}
        viewedMonth={viewedMonth}
        onViewedMonthChange={(nextMonth) => {
          setViewedMonth(nextMonth);
          onViewedMonthChange(nextMonth);
        }}
        selectedSlotId={selectedSlotId}
        onSlotChange={(slotId) => {
          setSelectedSlotId(slotId);
          onSlotChange(slotId);
        }}
        availability={availability}
        timeZone={timeZone}
        locale={locale}
        timeFormat={timeFormat}
        weekStart={1}
        onSendInvite={onSendInvite}
        onSkip={onSkip}
        onRetry={onRetry}
        uncheckedAttendees={uncheckedAttendees}
        disabled={disabled}
        isSending={isSending}
        reviewFields={reviewFields}
      />
      {isDefined(availabilityAfterRefresh) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAvailability(availabilityAfterRefresh)}
        >
          Refresh availability
        </Button>
      )}
    </StyledExample>
  );
};
