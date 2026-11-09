import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallConfirmForm } from '@/getting-started/components/GettingStartedBookCallConfirmForm';
import { GettingStartedBookCallSlotPicker } from '@/getting-started/components/GettingStartedBookCallSlotPicker';
import { type CalSlot } from '@/getting-started/types/CalSlot';
import { getCalEventTypeReference } from '@/getting-started/utils/getCalEventTypeReference';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Both steps share one grid cell, so the form takes the picker's height.
const StyledSteps = styled.div`
  display: grid;

  > * {
    display: flex;
    flex-direction: column;
    grid-area: 1 / 1;
  }
`;

const StyledPickerStep = styled.div<{ isHidden: boolean }>`
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
`;

export const GettingStartedBookCallAction = () => {
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const { timeFormat: preferredTimeFormat } = useDateTimeFormat();
  const [timeFormat, setTimeFormat] = useState(preferredTimeFormat);
  const { userTimezone } = useUserTimezone();
  const [timeZone, setTimeZone] = useState(userTimezone);
  const [selectedSlot, setSelectedSlot] = useState<CalSlot | null>(null);

  const eventTypeReference = isNonEmptyString(calendarBookingPageId)
    ? getCalEventTypeReference(calendarBookingPageId)
    : null;

  if (
    !isNonEmptyString(calendarBookingPageId) ||
    !isDefined(eventTypeReference)
  ) {
    return null;
  }

  const isConfirming = isDefined(selectedSlot);

  return (
    <StyledSteps>
      <StyledPickerStep isHidden={isConfirming} aria-hidden={isConfirming}>
        <GettingStartedBookCallSlotPicker
          calendarBookingPageId={calendarBookingPageId}
          timeZone={timeZone}
          onTimeZoneChange={setTimeZone}
          timeFormat={timeFormat}
          onTimeFormatChange={setTimeFormat}
          onSelectSlot={setSelectedSlot}
        />
      </StyledPickerStep>
      {isConfirming && (
        <GettingStartedBookCallConfirmForm
          eventTypeReference={eventTypeReference}
          slot={selectedSlot}
          timeZone={timeZone}
          timeFormat={timeFormat}
          onBack={() => setSelectedSlot(null)}
          onBooked={() => setSelectedSlot(null)}
        />
      )}
    </StyledSteps>
  );
};
