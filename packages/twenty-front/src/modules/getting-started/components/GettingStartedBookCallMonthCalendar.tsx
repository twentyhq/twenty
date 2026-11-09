import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCalendar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledMonth = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledNavigation = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const StyledWeekDay = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[2]};
  text-align: center;
  text-transform: uppercase;
`;

// Every month reserves six week rows so the step keeps the same height.
const CALENDAR_WEEK_COUNT = 6;
const DAY_HEIGHT_PX = 32;

const StyledEmptyDay = styled.span`
  height: ${DAY_HEIGHT_PX}px;
`;

const StyledDay = styled.button`
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  height: ${DAY_HEIGHT_PX}px;
  position: relative;

  &:not(:disabled) {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.primary};
    cursor: pointer;
    font-weight: ${themeCssVariables.font.weight.semiBold};
  }

  &:not(:disabled):hover {
    background: ${themeCssVariables.background.quaternary};
  }

  &[aria-pressed='true'],
  &[aria-pressed='true']:hover {
    background: ${themeCssVariables.background.invertedPrimary};
    color: ${themeCssVariables.font.color.inverted};
  }

  &[data-today]::after {
    background: currentColor;
    border-radius: ${themeCssVariables.border.radius.rounded};
    bottom: 4px;
    content: '';
    height: 4px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    width: 4px;
  }
`;

type GettingStartedBookCallMonthCalendarProps = {
  displayedMonth: Temporal.PlainDate;
  weeks: Temporal.PlainDate[][];
  weekDayLabels: string[];
  availableDayKeys: string[];
  selectedDayKey: string | null;
  todayKey: string;
  canGoToPreviousMonth: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dayKey: string) => void;
};

export const GettingStartedBookCallMonthCalendar = ({
  displayedMonth,
  weeks,
  weekDayLabels,
  availableDayKeys,
  selectedDayKey,
  todayKey,
  canGoToPreviousMonth,
  onPreviousMonth,
  onNextMonth,
  onSelectDay,
}: GettingStartedBookCallMonthCalendarProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const formatPlainDate = (day: Temporal.PlainDate, dateFormat: string) =>
    format(turnPlainDateToShiftedDateInSystemTimeZone(day), dateFormat, {
      locale: localeCatalog,
    });

  return (
    <StyledCalendar>
      <StyledHeader>
        <StyledMonth>
          {formatPlainDate(displayedMonth, 'MMMM')}{' '}
          <StyledYear>{formatPlainDate(displayedMonth, 'yyyy')}</StyledYear>
        </StyledMonth>
        <StyledNavigation>
          <LightIconButton
            size="sm"
            aria-label={t`Previous month`}
            disabled={!canGoToPreviousMonth}
            onClick={onPreviousMonth}
          >
            <IconChevronLeft />
          </LightIconButton>
          <LightIconButton
            size="sm"
            aria-label={t`Next month`}
            onClick={onNextMonth}
          >
            <IconChevronRight />
          </LightIconButton>
        </StyledNavigation>
      </StyledHeader>
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
              aria-label={formatPlainDate(day, 'EEEE, MMMM d')}
              aria-pressed={dayKey === selectedDayKey}
              data-today={dayKey === todayKey || undefined}
              disabled={!availableDayKeys.includes(dayKey)}
              onClick={() => onSelectDay(dayKey)}
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
