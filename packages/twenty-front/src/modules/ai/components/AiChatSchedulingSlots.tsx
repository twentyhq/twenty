import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconClock } from 'twenty-ui/icon';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatSchedulingAvailability } from '@/ai/types/AiChatSchedulingAvailability';
import { type AiChatSchedulingSlot } from '@/ai/types/AiChatSchedulingSlot';
import { TimeFormat } from '@/localization/constants/TimeFormat';

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
  timezone: string;
  locale: string;
  timeFormat: TimeFormat;
  disabled: boolean;
};

export const AiChatSchedulingSlots = ({
  availability,
  date,
  slots,
  selectedSlotId,
  onSlotChange,
  onRetry,
  timezone,
  locale,
  timeFormat,
  disabled,
}: AiChatSchedulingSlotsProps) => {
  const { t } = useLingui();
  const dateLabel = isDefined(date)
    ? new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${date}T00:00:00Z`))
    : t`Choose a date`;
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: timeFormat === TimeFormat.HOUR_24 ? '2-digit' : 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    ...(timeFormat === TimeFormat.SYSTEM
      ? {}
      : { hour12: timeFormat === TimeFormat.HOUR_12 }),
  });
  const isLoading = availability.status === 'loading';
  const isStale =
    (availability.status === 'ready' || availability.status === 'changed') &&
    availability.date !== date;

  return (
    <StyledSlots aria-busy={isLoading}>
      <StyledDate>{dateLabel}</StyledDate>
      <StyledDate>{timezone}</StyledDate>
      {availability.status === 'error' && (
        <InlineBanner
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
      {availability.status === 'changed' && !isStale && (
        <InlineBanner status="warning" layout="compact">
          {t`That time is no longer available. Choose another time.`}
        </InlineBanner>
      )}
      {isStale && (
        <InlineBanner
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
        {isLoading && (
          <StyledMessage>{t`Checking calendar availability…`}</StyledMessage>
        )}
        {!isLoading &&
          !isStale &&
          availability.status !== 'error' &&
          !isNonEmptyArray(slots) && (
            <StyledMessage>
              {isDefined(date)
                ? t`No available times. Choose another date.`
                : t`Choose a date to see available times.`}
            </StyledMessage>
          )}
      </div>
      {isNonEmptyArray(slots) && (
        <RadioGroup
          aria-label={t`Available times`}
          value={selectedSlotId}
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
