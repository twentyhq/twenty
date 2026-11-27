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
  daysOfWeek: CalendarEventRecurrenceWeekday[];
  startDateInTimeZone: string;
  onDaysOfWeekChange: (daysOfWeek: CalendarEventRecurrenceWeekday[]) => void;
};

export const CalendarEventRecurrenceDaysOfWeekInput = ({
  daysOfWeek,
  startDateInTimeZone,
  onDaysOfWeekChange,
}: CalendarEventRecurrenceDaysOfWeekInputProps) => {
  const { t, i18n } = useLingui();
  const { calendarStartDay } = useDateTimeFormat();

  const startWeekday =
    getCalendarEventRecurrenceWeekdayOfDate(startDateInTimeZone);
  const selectedDaysOfWeek = [startWeekday, ...daysOfWeek];

  const weekdayLabelsFromSunday = getDatePickerWeekdayLabels(i18n.locale);
  const weekStartIndexFromSunday =
    getDatePickerWeekStartOrThrow(calendarStartDay);
  const weekdayIndexesFromWeekStart = [0, 1, 2, 3, 4, 5, 6].map(
    (dayOffset) => (weekStartIndexFromSunday + dayOffset) % 7,
  );

  const selectedWeekdayIndexes = weekdayIndexesFromWeekStart.filter(
    (weekdayIndex) =>
      selectedDaysOfWeek.includes(
        CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[weekdayIndex],
      ),
  );
  const selectedWeekdayLabels = selectedWeekdayIndexes.map(
    (weekdayIndex) => weekdayLabelsFromSunday[weekdayIndex],
  );
  const selectedDaysOfWeekLabel = new Intl.ListFormat(i18n.locale, {
    style: 'short',
    type: 'unit',
  }).format(selectedWeekdayLabels);

  const handleSelectedDaysOfWeekChange = (nextSelectedDaysOfWeek: string[]) => {
    const nextDaysOfWeek =
      CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY.filter(
        (weekday) =>
          weekday !== startWeekday && nextSelectedDaysOfWeek.includes(weekday),
      );

    onDaysOfWeekChange(nextDaysOfWeek);
  };

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
            onValueChange={handleSelectedDaysOfWeekChange}
          >
            <Dropdown.Section>
              {weekdayIndexesFromWeekStart.map((weekdayIndex) => {
                const weekday =
                  CALENDAR_EVENT_RECURRENCE_WEEKDAYS_FROM_SUNDAY[weekdayIndex];
                const isStartWeekday = weekday === startWeekday;

                return (
                  <Dropdown.OptionItem
                    key={weekday}
                    value={weekday}
                    disabled={isStartWeekday}
                    description={isStartWeekday ? t`First event` : undefined}
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
