import { CalendarEventRecurrenceDaysOfWeekInput } from '@/activities/calendar/components/CalendarEventRecurrenceDaysOfWeekInput';
import { type useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { type CalendarEventRecurrenceEnd } from '@/activities/calendar/types/CalendarEventRecurrenceEnd';
import { getCalendarEventRecurrenceIntervalUnitLabel } from '@/activities/calendar/utils/getCalendarEventRecurrenceIntervalUnitLabel';
import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { NumberStepper } from 'twenty-ui/components/input';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  CalendarEventRecurrenceFrequency,
  type CalendarEventRecurrenceWeekday,
} from '~/generated-metadata/graphql';

const StyledInlineControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledNonShrinkingContainer = styled.div`
  flex-shrink: 0;
`;

const StyledUnitLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

type CalendarEventComposerRecurrenceFieldsProps = {
  composerState: ReturnType<typeof useCalendarEventComposer>;
};

export const CalendarEventComposerRecurrenceFields = ({
  composerState,
}: CalendarEventComposerRecurrenceFieldsProps) => {
  const { t, i18n } = useLingui();
  const {
    recurrence,
    startDateInTimeZone,
    updateRecurrence,
    handleRecurrenceFrequencyChange,
    handleRecurrenceEndTypeChange,
  } = composerState;

  const startDate = Temporal.PlainDate.from(startDateInTimeZone);
  const startDayOfMonth = startDate.day;
  const startMonthAndDay = startDate.toLocaleString(i18n.locale, {
    month: 'long',
    day: 'numeric',
  });

  const frequencyOptions: SelectOption<CalendarEventRecurrenceFrequency | null>[] =
    [
      { label: t`Does not repeat`, value: null },
      { label: t`Daily`, value: CalendarEventRecurrenceFrequency.DAILY },
      { label: t`Weekly`, value: CalendarEventRecurrenceFrequency.WEEKLY },
      {
        label: t`Monthly on day ${startDayOfMonth}`,
        value: CalendarEventRecurrenceFrequency.MONTHLY,
      },
      {
        label: t`Yearly on ${startMonthAndDay}`,
        value: CalendarEventRecurrenceFrequency.YEARLY,
      },
    ];

  const endTypeOptions: SelectOption<CalendarEventRecurrenceEnd['type']>[] = [
    { label: t`Never`, value: 'NEVER' },
    { label: t`On date`, value: 'ON_DATE' },
    { label: t`After`, value: 'AFTER_OCCURRENCE_COUNT' },
  ];

  const handleIntervalChange = (interval: number | null) => {
    if (isDefined(interval) && interval >= 1) {
      updateRecurrence({ interval });
    }
  };

  const handleDaysOfWeekChange = (
    daysOfWeek: CalendarEventRecurrenceWeekday[],
  ) => {
    updateRecurrence({ daysOfWeek });
  };

  const handleEndDateChange = (endDate: string | null) => {
    if (isDefined(endDate)) {
      updateRecurrence({
        end: { type: 'ON_DATE', endDate: endDate.slice(0, 10) },
      });
    }
  };

  const handleOccurrenceCountChange = (occurrenceCount: number | null) => {
    if (isDefined(occurrenceCount) && occurrenceCount >= 1) {
      updateRecurrence({
        end: { type: 'AFTER_OCCURRENCE_COUNT', occurrenceCount },
      });
    }
  };

  const frequencyFieldRow = (
    <ComposerFieldRow label={t`Repeat`}>
      <Select
        dropdownId="calendar-event-composer-recurrence-frequency"
        fullWidth
        variant="transparent"
        value={recurrence?.frequency ?? null}
        options={frequencyOptions}
        onChange={handleRecurrenceFrequencyChange}
      />
    </ComposerFieldRow>
  );

  if (!isDefined(recurrence)) {
    return frequencyFieldRow;
  }

  const intervalUnitLabel = getCalendarEventRecurrenceIntervalUnitLabel({
    frequency: recurrence.frequency,
    interval: recurrence.interval,
  });
  const isWeekly =
    recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY;
  const { end } = recurrence;
  const isEndingOnDate = end.type === 'ON_DATE';
  const isEndingAfterOccurrenceCount = end.type === 'AFTER_OCCURRENCE_COUNT';
  const occurrenceCountUnitLabel = isEndingAfterOccurrenceCount
    ? plural(end.occurrenceCount, { one: 'occurrence', other: 'occurrences' })
    : undefined;

  return (
    <>
      {frequencyFieldRow}
      <ComposerFieldRow label={t`Every`}>
        <StyledInlineControls>
          <NumberStepper
            aria-label={t`Repeat interval`}
            min={1}
            value={recurrence.interval}
            onValueChange={handleIntervalChange}
          />
          <StyledUnitLabel>{intervalUnitLabel}</StyledUnitLabel>
        </StyledInlineControls>
      </ComposerFieldRow>
      {isWeekly && (
        <ComposerFieldRow label={t`On`}>
          <CalendarEventRecurrenceDaysOfWeekInput
            daysOfWeek={recurrence.daysOfWeek}
            startDateInTimeZone={startDateInTimeZone}
            onDaysOfWeekChange={handleDaysOfWeekChange}
          />
        </ComposerFieldRow>
      )}
      <ComposerFieldRow label={t`Ends`}>
        <StyledInlineControls>
          <StyledNonShrinkingContainer>
            <Select
              dropdownId="calendar-event-composer-recurrence-end-type"
              variant="transparent"
              value={end.type}
              options={endTypeOptions}
              onChange={handleRecurrenceEndTypeChange}
            />
          </StyledNonShrinkingContainer>
          {isEndingOnDate && (
            <FormDateFieldInput
              key={end.endDate}
              variant="transparent"
              defaultValue={end.endDate}
              onChange={handleEndDateChange}
            />
          )}
          {isEndingAfterOccurrenceCount && (
            <>
              <NumberStepper
                aria-label={t`Number of occurrences`}
                min={1}
                value={end.occurrenceCount}
                onValueChange={handleOccurrenceCountChange}
              />
              <StyledUnitLabel>{occurrenceCountUnitLabel}</StyledUnitLabel>
            </>
          )}
        </StyledInlineControls>
      </ComposerFieldRow>
    </>
  );
};
