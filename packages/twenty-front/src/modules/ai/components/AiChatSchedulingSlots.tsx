import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { fromZonedTime } from 'date-fns-tz';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconClock } from 'twenty-ui/icon';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatSchedulingAvailability } from '@/ai/types/AiChatSchedulingAvailability';
import { type AiChatSchedulingSlot } from '@/ai/types/AiChatSchedulingSlot';
import { hasMixedTimeZoneOffsets } from '@/ai/utils/hasMixedTimeZoneOffsets';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { resolveTimeFormat } from '@/localization/utils/resolveTimeFormat';

const StyledSlots = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledDate = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatSchedulingSlotsProps = {
  availability: AiChatSchedulingAvailability;
  date: string | null;
  slots: readonly AiChatSchedulingSlot[];
  selectedSlotId: string | null;
  onSlotChange: (slotId: string | null) => void;
  onRetry: () => void;
  timeZone: string;
  locale: string;
  timeFormat: TimeFormat;
  disabled: boolean;
};

const formatDateLabel = ({
  date,
  locale,
}: {
  date: string | null;
  locale: string;
}) => {
  if (!isDefined(date)) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory',
    timeZone: doNotTranslate('UTC'),
  }).format(new Date(doNotTranslate(`${date}T00:00:00Z`)));
};

export const AiChatSchedulingSlots = ({
  availability,
  date,
  slots,
  selectedSlotId,
  onSlotChange,
  onRetry,
  timeZone,
  locale,
  timeFormat,
  disabled,
}: AiChatSchedulingSlotsProps) => {
  const { t } = useLingui();
  const dateLabel = formatDateLabel({ date, locale }) ?? t`Choose a date`;
  const resolvedTimeFormat = resolveTimeFormat(timeFormat);
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: resolvedTimeFormat === TimeFormat.HOUR_24 ? '2-digit' : 'numeric',
    minute: '2-digit',
    timeZone,
    hourCycle: resolvedTimeFormat === TimeFormat.HOUR_24 ? 'h23' : 'h12',
    timeZoneName: hasMixedTimeZoneOffsets({ slots, timeZone })
      ? 'short'
      : undefined,
  });
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const referenceSlot = selectedSlot ?? slots[0];
  const getTimeZoneReferenceDate = () => {
    if (isDefined(referenceSlot)) {
      return new Date(referenceSlot.startsAt);
    }

    if (isDefined(date)) {
      return fromZonedTime(doNotTranslate(`${date}T12:00:00`), timeZone);
    }

    return undefined;
  };
  const timeZoneLabel = formatTimeZoneLabel({
    timeZone,
    referenceDate: getTimeZoneReferenceDate(),
  });
  const isAvailabilityForSelectedDate =
    isDefined(date) && availability.date === date;
  const isStale = isDefined(date) && !isAvailabilityForSelectedDate;
  const isLoading =
    isAvailabilityForSelectedDate && availability.status === 'loading';
  const isSelectedSlotUnavailable =
    isAvailabilityForSelectedDate &&
    availability.status === 'ready' &&
    isDefined(selectedSlotId) &&
    !isDefined(selectedSlot);

  return (
    <StyledSlots aria-busy={isLoading}>
      <StyledDate>{dateLabel}</StyledDate>
      <StyledDate>{timeZoneLabel}</StyledDate>
      {isAvailabilityForSelectedDate && availability.status === 'error' && (
        <InlineBanner
          role="alert"
          status="error"
          layout="compact"
          action={
            <InlineBanner.Action onClick={onRetry} disabled={disabled}>
              {t`Try again`}
            </InlineBanner.Action>
          }
        >
          {availability.message ??
            t`Calendar availability could not be checked.`}
        </InlineBanner>
      )}
      {isSelectedSlotUnavailable && (
        <InlineBanner role="alert" status="warning" layout="compact">
          {t`That time is no longer available. Choose another time.`}
        </InlineBanner>
      )}
      {isStale && (
        <InlineBanner
          role="status"
          status="info"
          layout="compact"
          action={
            <InlineBanner.Action onClick={onRetry} disabled={disabled}>
              {t`Refresh`}
            </InlineBanner.Action>
          }
        >
          {t`Refresh availability for this date.`}
        </InlineBanner>
      )}
      <div role="status" aria-atomic="true">
        {!isDefined(date) && (
          <StyledMessage>{t`Choose a date to see available times.`}</StyledMessage>
        )}
        {isLoading && (
          <StyledMessage>{t`Checking calendar availability…`}</StyledMessage>
        )}
        {isAvailabilityForSelectedDate &&
          availability.status === 'ready' &&
          !isNonEmptyArray(slots) && (
            <StyledMessage>
              {t`No available times. Choose another date.`}
            </StyledMessage>
          )}
      </div>
      {isNonEmptyArray(slots) && (
        <RadioGroup
          aria-label={t`Available times`}
          value={selectedSlot?.id ?? null}
          onValueChange={onSlotChange}
          disabled={disabled}
        >
          {slots.map((slot) => (
            <Radio.Root
              key={slot.id}
              value={slot.id}
              render={
                <ListItem
                  selected={selectedSlotId === slot.id}
                  startIcon={<IconClock size={16} aria-hidden="true" />}
                  description={slot.isRecommended ? t`Recommended` : undefined}
                />
              }
            >
              {timeFormatter.format(new Date(slot.startsAt))}
              {' – '}
              {timeFormatter.format(new Date(slot.endsAt))}
            </Radio.Root>
          ))}
        </RadioGroup>
      )}
    </StyledSlots>
  );
};
