import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Temporal } from 'temporal-polyfill';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getCalendarMonthGridDays } from '~/utils/dates/getCalendarMonthGridDays';

const DAY_CELL_SIZE = '34px';

const StyledGrid = styled.div<{ disabled: boolean }>`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(7, ${DAY_CELL_SIZE});
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  padding-bottom: ${themeCssVariables.spacing[1]};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const StyledWeekdayName = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 40px;
  text-align: center;
`;

const StyledDay = styled.button<{
  isHighlighted: boolean;
  isOutsideMonth: boolean;
  isToday: boolean;
}>`
  background: ${({ isHighlighted }) =>
    isHighlighted ? themeCssVariables.color.blue : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isHighlighted, isOutsideMonth }) =>
    isHighlighted
      ? themeCssVariables.background.primary
      : isOutsideMonth
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;

  &:disabled {
    cursor: default;
  }
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
  height: ${DAY_CELL_SIZE};
  padding: 0;

  &:hover {
    background: ${({ isHighlighted }) =>
      isHighlighted
        ? themeCssVariables.color.blue
        : themeCssVariables.background.transparent.light};
  }
`;

type DatePickerMonthGridProps = {
  visibleMonthDate: Temporal.PlainDate;
  selectedDate?: Temporal.PlainDate | null;
  rangeStartDate?: Temporal.PlainDate | null;
  rangeEndDate?: Temporal.PlainDate | null;
  disabled?: boolean;
  onDateClick: (plainDate: Temporal.PlainDate) => void;
};

export const DatePickerMonthGrid = ({
  visibleMonthDate,
  selectedDate,
  rangeStartDate,
  rangeEndDate,
  disabled = false,
  onDateClick,
}: DatePickerMonthGridProps) => {
  const { t } = useLingui();
  const { calendarSystem } = useDateTimeFormat();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const days = getCalendarMonthGridDays({
    date: visibleMonthDate,
    calendarSystem,
    weekStartsOnDayIndex: convertFirstDayOfTheWeekToCalendarStartDayNumber(
      userFirstDayOfTheWeek,
    ),
  });
  const visibleMonthCode =
    visibleMonthDate.withCalendar(calendarSystem).monthCode;

  const today = Temporal.Now.plainDateISO();

  const weekdayFormatter = new Intl.DateTimeFormat(localeCatalog.code, {
    weekday: 'short',
  });
  const fullDateFormatter = new Intl.DateTimeFormat(localeCatalog.code, {
    dateStyle: 'full',
    calendar: calendarSystem,
  });

  const toJSDate = (plainDate: Temporal.PlainDate) =>
    new Date(plainDate.year, plainDate.month - 1, plainDate.day);

  const isInRange = (plainDate: Temporal.PlainDate) =>
    isDefined(rangeStartDate) &&
    isDefined(rangeEndDate) &&
    Temporal.PlainDate.compare(plainDate, rangeStartDate) >= 0 &&
    Temporal.PlainDate.compare(plainDate, rangeEndDate) <= 0;

  return (
    <StyledGrid disabled={disabled}>
      {days.slice(0, 7).map((plainDate) => (
        <StyledWeekdayName key={plainDate.dayOfWeek}>
          {weekdayFormatter.format(toJSDate(plainDate))}
        </StyledWeekdayName>
      ))}
      {days.map((plainDate) => {
        const calendarPlainDate = plainDate.withCalendar(calendarSystem);
        const fullDate = fullDateFormatter.format(toJSDate(plainDate));

        return (
          <StyledDay
            key={plainDate.toString()}
            type="button"
            disabled={disabled}
            aria-label={t`Choose ${fullDate}`}
            isHighlighted={
              (isDefined(selectedDate) && plainDate.equals(selectedDate)) ||
              isInRange(plainDate)
            }
            isOutsideMonth={calendarPlainDate.monthCode !== visibleMonthCode}
            isToday={plainDate.equals(today)}
            onClick={() => onDateClick(plainDate)}
          >
            {calendarPlainDate.day}
          </StyledDay>
        );
      })}
    </StyledGrid>
  );
};
