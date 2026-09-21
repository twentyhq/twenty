import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShiftCoverageMatrix } from '@/shift/components/ShiftCoverageMatrix';
import { ShiftPageShell } from '@/shift/components/ShiftPageShell';
import { ShiftTopBar } from '@/shift/components/ShiftTopBar';
import { useShiftRoster } from '@/shift/hooks/useShiftRoster';
import { useShiftViews } from '@/shift/hooks/useShiftViews';
import {
  buildCoverageMatrix,
  computeAttendance,
} from '@/shift/utils/shiftCoverage';
import {
  addMonthsToMonthValue,
  buildIctMonthCalendar,
  getIctMonthValue,
  getIctToday,
  getIctWeekRange,
  getMonthLabel,
} from '@/shift/utils/shiftWeek';

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

type ViewMode = 'week' | 'month';

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing['6']};
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['3']};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledModeToggle = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['1']};
`;

const StyledNavRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledRangeLabel = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledRangeTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledRangeDates = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledKpiRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['3']};
`;

const StyledKpiCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  min-width: 116px;
  padding: ${themeCssVariables.spacing['3']} ${themeCssVariables.spacing['4']};
`;

const StyledKpiValue = styled.span<{ accent: 'default' | 'red' }>`
  color: ${({ accent }) =>
    accent === 'red'
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledKpiLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledLegend = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['4']};
`;

const StyledLegendItem = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['1']};
`;

const StyledSwatch = styled.span<{ variant: 'covered' | 'gap' }>`
  background: ${({ variant }) =>
    variant === 'covered'
      ? themeCssVariables.tag.background.green
      : themeCssVariables.tag.background.red};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 12px;
  width: 12px;
`;

const StyledStateText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: auto;
`;

const ShiftAnalyticsBody = () => {
  const { t } = useLingui();

  const nowMs = useMemo(() => Date.now(), []);
  const today = useMemo(() => getIctToday(new Date(nowMs)), [nowMs]);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthValue, setMonthValue] = useState(() => getIctMonthValue());

  const currentMonth = useMemo(() => getIctMonthValue(), []);

  // The viewed range + its day columns, driven by the active view mode.
  const { fromDate, toDate, days } = useMemo(() => {
    if (viewMode === 'month') {
      const calendar = buildIctMonthCalendar(monthValue);

      return {
        fromDate: calendar.fromDate,
        toDate: calendar.toDate,
        days: calendar.weeks.flat().filter(isDefined),
      };
    }

    return getIctWeekRange(
      new Date(nowMs + weekOffset * MILLISECONDS_PER_WEEK),
    );
  }, [viewMode, monthValue, nowMs, weekOffset]);

  const { roster, loading } = useShiftRoster({ fromDate, toDate });

  const matrix = useMemo(
    () => buildCoverageMatrix({ roster, days }),
    [roster, days],
  );

  const attendance = useMemo(
    () => computeAttendance(roster, new Date(nowMs)),
    [roster, nowMs],
  );

  const weekdayLabels = [
    t`Mon`,
    t`Tue`,
    t`Wed`,
    t`Thu`,
    t`Fri`,
    t`Sat`,
    t`Sun`,
  ];

  const isAtAnchor =
    viewMode === 'week' ? weekOffset === 0 : monthValue === currentMonth;

  const rangeTitle =
    viewMode === 'month'
      ? getMonthLabel(monthValue)
      : weekOffset === 0
        ? t`This week`
        : weekOffset === 1
          ? t`Next week`
          : weekOffset === -1
            ? t`Last week`
            : t`Week`;

  const goPrevious = () => {
    if (viewMode === 'month') {
      setMonthValue((previous) => addMonthsToMonthValue(previous, -1));
    } else {
      setWeekOffset((previous) => previous - 1);
    }
  };

  const goNext = () => {
    if (viewMode === 'month') {
      setMonthValue((previous) => addMonthsToMonthValue(previous, 1));
    } else {
      setWeekOffset((previous) => previous + 1);
    }
  };

  const goToAnchor = () => {
    if (viewMode === 'month') {
      setMonthValue(currentMonth);
    } else {
      setWeekOffset(0);
    }
  };

  return (
    <StyledPageBody>
      <StyledHeaderRow>
        <StyledTitle>{t`24/7 coverage`}</StyledTitle>
        <StyledModeToggle>
          <Button
            title={t`Week`}
            variant={viewMode === 'week' ? 'primary' : 'secondary'}
            accent={viewMode === 'week' ? 'blue' : 'default'}
            onClick={() => setViewMode('week')}
          />
          <Button
            title={t`Month`}
            variant={viewMode === 'month' ? 'primary' : 'secondary'}
            accent={viewMode === 'month' ? 'blue' : 'default'}
            onClick={() => setViewMode('month')}
          />
        </StyledModeToggle>
      </StyledHeaderRow>

      <StyledNavRow>
        <Button
          Icon={IconChevronLeft}
          title={viewMode === 'month' ? t`Previous month` : t`Previous week`}
          variant="secondary"
          onClick={goPrevious}
        />
        <StyledRangeLabel>
          <StyledRangeTitle>{rangeTitle}</StyledRangeTitle>
          <StyledRangeDates>
            {fromDate} → {toDate}
          </StyledRangeDates>
        </StyledRangeLabel>
        {!isAtAnchor && (
          <Button
            title={viewMode === 'month' ? t`This month` : t`This week`}
            variant="secondary"
            onClick={goToAnchor}
          />
        )}
        <Button
          Icon={IconChevronRight}
          title={viewMode === 'month' ? t`Next month` : t`Next week`}
          variant="secondary"
          onClick={goNext}
        />
      </StyledNavRow>

      <StyledKpiRow>
        <StyledKpiCard>
          <StyledKpiValue accent="default">
            {isDefined(matrix.coveragePercent)
              ? `${matrix.coveragePercent}%`
              : '—'}
          </StyledKpiValue>
          <StyledKpiLabel>{t`Coverage`}</StyledKpiLabel>
        </StyledKpiCard>
        <StyledKpiCard>
          <StyledKpiValue accent="default">
            {isDefined(attendance.attendancePercent)
              ? `${attendance.attendancePercent}%`
              : '—'}
          </StyledKpiValue>
          <StyledKpiLabel>{t`Attendance`}</StyledKpiLabel>
        </StyledKpiCard>
        <StyledKpiCard>
          <StyledKpiValue accent={matrix.gapCount > 0 ? 'red' : 'default'}>
            {matrix.gapCount}
          </StyledKpiValue>
          <StyledKpiLabel>{t`Gaps`}</StyledKpiLabel>
        </StyledKpiCard>
        <StyledKpiCard>
          <StyledKpiValue accent="default">
            {matrix.totalShiftCount}
          </StyledKpiValue>
          <StyledKpiLabel>{t`Shifts`}</StyledKpiLabel>
        </StyledKpiCard>
        <StyledKpiCard>
          <StyledKpiValue accent="default">{matrix.staffCount}</StyledKpiValue>
          <StyledKpiLabel>{t`Staff`}</StyledKpiLabel>
        </StyledKpiCard>
      </StyledKpiRow>

      <StyledLegend>
        <StyledLegendItem>
          <StyledSwatch variant="covered" />
          {t`Covered (staff on shift)`}
        </StyledLegendItem>
        <StyledLegendItem>
          <StyledSwatch variant="gap" />
          {t`Gap — nobody on shift`}
        </StyledLegendItem>
      </StyledLegend>

      {loading && roster.length === 0 ? (
        <StyledStateText>{t`Loading…`}</StyledStateText>
      ) : (
        <ShiftCoverageMatrix
          matrix={matrix}
          days={days}
          weekdayLabels={weekdayLabels}
          today={today}
        />
      )}
    </StyledPageBody>
  );
};

export const ShiftAnalyticsPage = () => {
  const { tableView } = useShiftViews();

  if (!isDefined(tableView)) {
    return null;
  }

  return (
    <ShiftPageShell viewId={tableView.id}>
      <ShiftTopBar />
      <ShiftAnalyticsBody />
    </ShiftPageShell>
  );
};
