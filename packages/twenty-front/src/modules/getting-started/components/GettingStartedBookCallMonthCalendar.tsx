import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useRecordCalendarDaysRange } from '@/object-record/record-calendar/hooks/useRecordCalendarDaysRange';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { format } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

// Every month reserves six week rows so the preview keeps its height once
// the availability loads.
const CALENDAR_WEEK_COUNT = 6;
const DAY_HEIGHT_PX = 28;

const StyledCalendar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledMonth = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const StyledWeekDay = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};
  text-align: center;
  text-transform: uppercase;
`;

const StyledEmptyDay = styled.span`
  height: ${DAY_HEIGHT_PX}px;
`;

const StyledDay = styled.button`
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${DAY_HEIGHT_PX}px;
  padding: 0;
  position: relative;

  &:not(:disabled) {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.primary};
    cursor: pointer;
    font-weight: ${themeCssVariables.font.weight.semiBold};
    transition: background
      calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background: ${themeCssVariables.background.invertedPrimary};
    color: ${themeCssVariables.font.color.inverted};
    outline: none;
  }

  &[data-today]::after {
    background: currentColor;
    border-radius: ${themeCssVariables.border.radius.rounded};
    bottom: 3px;
    content: '';
    height: 3px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    width: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type GettingStartedBookCallMonthCalendarProps = {
  displayedMonth: Temporal.PlainDate;
  todayKey: string;
  availableDayKeys: string[];
  onSelectDay: (dayKey: string) => void;
};

export const GettingStartedBookCallMonthCalendar = ({
  displayedMonth,
  todayKey,
  availableDayKeys,
  onSelectDay,
}: GettingStartedBookCallMonthCalendarProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { days: weeks, weekDayLabels } = useRecordCalendarDaysRange(
    displayedMonth,
    ViewCalendarLayout.MONTH,
  );

  const formatPlainDate = (day: Temporal.PlainDate, dateFormat: string) =>
    format(turnPlainDateToShiftedDateInSystemTimeZone(day), dateFormat, {
      locale: localeCatalog,
    });

  return (
    <StyledCalendar>
      <StyledMonth>
        {formatPlainDate(displayedMonth, doNotTranslate('MMMM'))}{' '}
        <StyledYear>
          {formatPlainDate(displayedMonth, doNotTranslate('yyyy'))}
        </StyledYear>
      </StyledMonth>
      <StyledGrid>
        {weekDayLabels.map((weekDayLabel) => (
          <StyledWeekDay key={weekDayLabel}>{weekDayLabel}</StyledWeekDay>
        ))}
        {weeks.flat().map((day) => {
          const dayKey = day.toString();

          if (day.month !== displayedMonth.month) {
            return <StyledEmptyDay key={dayKey} />;
          }

          return (
            <StyledDay
              key={dayKey}
              type="button"
              aria-label={formatPlainDate(day, doNotTranslate('EEEE, MMMM d'))}
              data-today={dayKey === todayKey || undefined}
              disabled={!availableDayKeys.includes(dayKey)}
              onClick={(event) => {
                event.stopPropagation();
                onSelectDay(dayKey);
              }}
            >
              {day.day}
            </StyledDay>
          );
        })}
        {Array.from(
          { length: (CALENDAR_WEEK_COUNT - weeks.length) * 7 },
          (_, index) => (
            <StyledEmptyDay key={`placeholder-${index}`} />
          ),
        )}
      </StyledGrid>
    </StyledCalendar>
  );
};
