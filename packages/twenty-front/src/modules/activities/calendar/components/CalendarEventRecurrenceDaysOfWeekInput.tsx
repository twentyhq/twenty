import { CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY } from '@/activities/calendar/constants/CalendarEventRecurrenceWeekdaysFromSunday';
import { getCalendarEventRecurrenceWeekdayOfDate } from '@/activities/calendar/utils/getCalendarEventRecurrenceWeekdayOfDate';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { getDatePickerWeekdayLabels } from '@/localization/utils/getDatePickerWeekdayLabels';
import { getDatePickerWeekStartOrThrow } from '@/ui/input/components/internal/date/utils/getDatePickerWeekStartOrThrow';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type CalendarEventRecurrenceWeekday } from '~/generated-metadata/graphql';

const StyledFullWidthContainer = styled.div`
  width: 100%;
`;

type CalendarEventRecurrenceDaysOfWeekInputProps = {
  additionalDaysOfWeek: CalendarEventRecurrenceWeekday[];
  startDateInTimeZone: string;
  onAdditionalDaysOfWeekChange: (
    additionalDaysOfWeek: CalendarEventRecurrenceWeekday[],
  ) => void;
};

export const CalendarEventRecurrenceDaysOfWeekInput = ({
  additionalDaysOfWeek,
  startDateInTimeZone,
  onAdditionalDaysOfWeekChange,
}: CalendarEventRecurrenceDaysOfWeekInputProps) => {
  const { t, i18n } = useLingui();
  const { calendarStartDay } = useDateTimeFormat();

  const startWeekday =
    getCalendarEventRecurrenceWeekdayOfDate(startDateInTimeZone);
  const selectedDaysOfWeek = [startWeekday, ...additionalDaysOfWeek];

  const weekdayLabelsFromSunday = getDatePickerWeekdayLabels(i18n.locale);
  const weekStartIndexFromSunday =
    getDatePickerWeekStartOrThrow(calendarStartDay);
  const weekdayIndexesFromWeekStart = [0, 1, 2, 3, 4, 5, 6].map(
    (dayOffset) => (weekStartIndexFromSunday + dayOffset) % 7,
  );

  const selectedDaysOfWeekLabel = new Intl.ListFormat(i18n.locale, {
    style: 'short',
    type: 'unit',
  }).format(
    weekdayIndexesFromWeekStart
      .filter((weekdayIndex) =>
        selectedDaysOfWeek.includes(
          CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[weekdayIndex],
        ),
      )
      .map((weekdayIndex) => weekdayLabelsFromSunday[weekdayIndex]),
  );

  return (
    <StyledFullWidthContainer>
      <DropdownRoot
        dropdownId="calendar-event-composer-recurrence-days-of-week"
        type="picker"
      >
        <Dropdown.Trigger render={<div />} nativeButton={false}>
          <MultiSelectControl
            selectedOptions={[]}
            fixedText={selectedDaysOfWeekLabel}
            variant="transparent"
          />
        </Dropdown.Trigger>
        <DropdownContent
          width={GenericDropdownContentWidth.Medium}
          align="start"
          aria-label={t`Repeat on`}
        >
          <Dropdown.SelectionGroup
            aria-label={t`Repeat on`}
            multiple
            value={selectedDaysOfWeek}
            onValueChange={(nextSelectedDaysOfWeek) =>
              onAdditionalDaysOfWeekChange(
                CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY.filter(
                  (weekday) =>
                    weekday !== startWeekday &&
                    nextSelectedDaysOfWeek.includes(weekday),
                ),
              )
            }
          >
            <Dropdown.Section>
              {weekdayIndexesFromWeekStart.map((weekdayIndex) => {
                const weekday =
                  CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[weekdayIndex];

                return (
                  <Dropdown.OptionItem
                    key={weekday}
                    value={weekday}
                    disabled={weekday === startWeekday}
                    description={
                      weekday === startWeekday ? t`First event` : undefined
                    }
                  >
                    {weekdayLabelsFromSunday[weekdayIndex]}
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.Section>
          </Dropdown.SelectionGroup>
        </DropdownContent>
      </DropdownRoot>
    </StyledFullWidthContainer>
  );
};
