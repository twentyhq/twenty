import { CalendarEventRecurrenceDaysOfWeekInput } from '@/activities/calendar/components/CalendarEventRecurrenceDaysOfWeekInput';
import { type useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { type CalendarEventRecurrenceEndCondition } from '@/activities/calendar/types/CalendarEventRecurrenceEndCondition';
import { getCalendarEventRecurrenceIntervalUnitLabel } from '@/activities/calendar/utils/getCalendarEventRecurrenceIntervalUnitLabel';
import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
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
    handleRecurrenceEndConditionChange,
  } = composerState;

  const startDayOfMonth = Temporal.PlainDate.from(startDateInTimeZone).day;
  const startMonthAndDay = new Intl.DateTimeFormat(i18n.locale, {
    month: 'long',
    day: 'numeric',
    timeZone: doNotTranslate('UTC'),
  }).format(new Date(`${startDateInTimeZone}T00:00:00Z`));

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

  const endConditionOptions: SelectOption<CalendarEventRecurrenceEndCondition>[] =
    [
      { label: t`Never`, value: 'NEVER' },
      { label: t`On date`, value: 'ON_DATE' },
      { label: t`After`, value: 'AFTER_OCCURRENCE_COUNT' },
    ];

  const handleIntervalChange = (interval: number | null) => {
    if (isDefined(interval) && interval >= 1) {
      updateRecurrence({ interval });
    }
  };

  const handleAdditionalDaysOfWeekChange = (
    additionalDaysOfWeek: CalendarEventRecurrenceWeekday[],
  ) => {
    updateRecurrence({ additionalDaysOfWeek });
  };

  const handleEndDateChange = (endDate: string | null) => {
    if (isDefined(endDate)) {
      updateRecurrence({ endDate: endDate.slice(0, 10) });
    }
  };

  const handleOccurrenceCountChange = (occurrenceCount: number | null) => {
    if (isDefined(occurrenceCount) && occurrenceCount >= 1) {
      updateRecurrence({ occurrenceCount });
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

  const intervalUnitLabel = getCalendarEventRecurrenceIntervalUnitLabel(
    recurrence.frequency,
    recurrence.interval,
  );
  const occurrenceCountUnitLabel = plural(recurrence.occurrenceCount, {
    one: 'occurrence',
    other: 'occurrences',
  });
  const isWeekly =
    recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY;
  const isEndingOnDate = recurrence.endCondition === 'ON_DATE';
  const isEndingAfterOccurrenceCount =
    recurrence.endCondition === 'AFTER_OCCURRENCE_COUNT';

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
            additionalDaysOfWeek={recurrence.additionalDaysOfWeek}
            startDateInTimeZone={startDateInTimeZone}
            onAdditionalDaysOfWeekChange={handleAdditionalDaysOfWeekChange}
          />
        </ComposerFieldRow>
      )}
      <ComposerFieldRow label={t`Ends`}>
        <StyledInlineControls>
          <StyledNonShrinkingContainer>
            <Select
              dropdownId="calendar-event-composer-recurrence-end-condition"
              variant="transparent"
              value={recurrence.endCondition}
              options={endConditionOptions}
              onChange={handleRecurrenceEndConditionChange}
            />
          </StyledNonShrinkingContainer>
          {isEndingOnDate && (
            <FormDateFieldInput
              key={recurrence.endDate}
              variant="transparent"
              defaultValue={recurrence.endDate}
              onChange={handleEndDateChange}
            />
          )}
          {isEndingAfterOccurrenceCount && (
            <>
              <NumberStepper
                aria-label={t`Number of occurrences`}
                min={1}
                value={recurrence.occurrenceCount}
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
