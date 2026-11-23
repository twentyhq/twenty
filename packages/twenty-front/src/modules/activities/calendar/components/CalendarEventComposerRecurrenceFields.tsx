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
import { CalendarEventRecurrenceFrequency } from '~/generated-metadata/graphql';

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
  const { recurrence, startDateInTimeZone, updateRecurrence } = composerState;

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

  return (
    <>
      <ComposerFieldRow label={t`Repeat`}>
        <Select
          dropdownId="calendar-event-composer-recurrence-frequency"
          fullWidth
          variant="transparent"
          value={recurrence?.frequency ?? null}
          options={frequencyOptions}
          onChange={composerState.handleRecurrenceFrequencyChange}
        />
      </ComposerFieldRow>
      {isDefined(recurrence) && (
        <>
          <ComposerFieldRow label={t`Every`}>
            <StyledInlineControls>
              <NumberStepper
                aria-label={t`Repeat interval`}
                min={1}
                value={recurrence.interval}
                onValueChange={(interval) => {
                  if (isDefined(interval) && interval >= 1) {
                    updateRecurrence({ interval });
                  }
                }}
              />
              <StyledUnitLabel>
                {getCalendarEventRecurrenceIntervalUnitLabel(
                  recurrence.frequency,
                  recurrence.interval,
                )}
              </StyledUnitLabel>
            </StyledInlineControls>
          </ComposerFieldRow>
          {recurrence.frequency === CalendarEventRecurrenceFrequency.WEEKLY && (
            <ComposerFieldRow label={t`On`}>
              <CalendarEventRecurrenceDaysOfWeekInput
                additionalDaysOfWeek={recurrence.additionalDaysOfWeek}
                startDateInTimeZone={startDateInTimeZone}
                onAdditionalDaysOfWeekChange={(additionalDaysOfWeek) =>
                  updateRecurrence({ additionalDaysOfWeek })
                }
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
                  onChange={composerState.handleRecurrenceEndConditionChange}
                />
              </StyledNonShrinkingContainer>
              {recurrence.endCondition === 'ON_DATE' && (
                <FormDateFieldInput
                  key={recurrence.endDate}
                  variant="transparent"
                  defaultValue={recurrence.endDate}
                  onChange={(endDate) => {
                    if (isDefined(endDate)) {
                      updateRecurrence({ endDate: endDate.slice(0, 10) });
                    }
                  }}
                />
              )}
              {recurrence.endCondition === 'AFTER_OCCURRENCE_COUNT' && (
                <>
                  <NumberStepper
                    aria-label={t`Number of occurrences`}
                    min={1}
                    value={recurrence.occurrenceCount}
                    onValueChange={(occurrenceCount) => {
                      if (isDefined(occurrenceCount) && occurrenceCount >= 1) {
                        updateRecurrence({ occurrenceCount });
                      }
                    }}
                  />
                  <StyledUnitLabel>
                    {plural(recurrence.occurrenceCount, {
                      one: 'occurrence',
                      other: 'occurrences',
                    })}
                  </StyledUnitLabel>
                </>
              )}
            </StyledInlineControls>
          </ComposerFieldRow>
        </>
      )}
    </>
  );
};
