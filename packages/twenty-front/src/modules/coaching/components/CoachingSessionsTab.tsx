import { useCoachingKpiAttendance } from '@/coaching/hooks/useCoachingKpiAttendance';
import { useCoachingSessionParticipation } from '@/coaching/hooks/useCoachingSessionParticipation';
import styled from '@emotion/styled';
import { useMemo } from 'react';

type CoachingSessionsTabProps = {
  email: string | null;
  wpUserId: string | null;
};

// -- Layout --

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledTopRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 1fr;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

// -- KPI Card --

const StyledKpiSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
`;

const StyledKpiHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const StyledKpiHeaderCell = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledKpiCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledKpiLabel = styled.div`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledKpiValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

// -- Bar Chart --

const StyledChartContainer = styled.div`
  align-items: flex-end;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: 2px;
  height: 200px;
  margin: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledBar = styled.div<{ heightPercent: number }>`
  background: ${({ theme }) => theme.color.blue};
  border-radius: 2px 2px 0 0;
  flex: 1;
  height: ${({ heightPercent }) => heightPercent}%;
  min-height: 2px;
  position: relative;
`;

const StyledBarLabel = styled.div`
  color: white;
  font-size: 10px;
  left: 50%;
  position: absolute;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledNoData = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
`;

// -- Sessions Table --

const StyledBottomRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 1fr;
`;

const StyledSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
`;

const StyledSectionHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTableHeader = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  text-align: left;
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

// -- Calendar --

const StyledCalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const StyledCalendarHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledCalendarNav = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
`;

const StyledNavButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.lg};
`;

const StyledCalendarDayHeader = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const StyledCalendarDay = styled.div<{ hasSession?: boolean; isToday?: boolean }>`
  background: ${({ hasSession, theme }) =>
    hasSession ? theme.color.blue + '20' : 'transparent'};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ isToday, theme }) =>
    isToday ? theme.color.blue : theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isToday, theme }) =>
    isToday ? theme.font.weight.semiBold : theme.font.weight.regular};
  min-height: 40px;
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const StyledEmptyText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatSessionDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
};

export const CoachingSessionsTab = ({
  email,
  wpUserId,
}: CoachingSessionsTabProps) => {
  const { sessions, loading: sessionsLoading } =
    useCoachingSessionParticipation(email, wpUserId);
  const { kpi, loading: kpiLoading } = useCoachingKpiAttendance(
    email,
    wpUserId,
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Build calendar data
  const sessionDates = useMemo(() => {
    const dates = new Set<string>();
    for (const session of sessions) {
      const dt = session.sessionDatetime as string | null;
      if (dt) {
        const d = new Date(dt);
        dates.add(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        );
      }
    }
    return dates;
  }, [sessions]);

  // Calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const days: { day: number; hasSession: boolean; isToday: boolean }[] = [];

    for (let i = 0; i < startDow; i++) {
      days.push({ day: 0, hasSession: false, isToday: false });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        hasSession: sessionDates.has(dateStr),
        isToday:
          d === now.getDate() &&
          currentMonth === now.getMonth() &&
          currentYear === now.getFullYear(),
      });
    }

    return days;
  }, [currentYear, currentMonth, sessionDates, now]);

  // Bar chart data — sessions per week from recent weeks
  const weeklyBars = useMemo(() => {
    const recentWeeks = kpi?.sessionsRecentWeeks;
    if (recentWeeks && typeof recentWeeks === 'string') {
      try {
        const parsed = JSON.parse(recentWeeks);
        if (Array.isArray(parsed)) {
          return parsed.map((val: number) => Number(val) || 0);
        }
      } catch {
        // not JSON
      }
    }
    // Fallback: group sessions by week
    const weekMap = new Map<string, number>();
    for (const session of sessions) {
      const dt = session.sessionDatetime as string | null;
      if (dt) {
        const d = new Date(dt);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
      }
    }
    return Array.from(weekMap.values()).slice(-12);
  }, [kpi, sessions]);

  const maxBar = Math.max(1, ...weeklyBars);

  if (sessionsLoading || kpiLoading) {
    return <StyledLoadingText>Loading session data...</StyledLoadingText>;
  }

  const avgPerWeek = kpi?.monthlyAvgSessionsPerWeek ?? kpi?.avgSessionsPerday;

  return (
    <StyledContainer>
      {/* Top row: KPI + Chart */}
      <StyledTopRow>
        <StyledKpiSection>
          <StyledKpiHeader>
            <StyledKpiHeaderCell>KPI</StyledKpiHeaderCell>
            <StyledKpiHeaderCell>N° Sessions</StyledKpiHeaderCell>
          </StyledKpiHeader>
          <StyledKpiCard>
            <StyledKpiLabel>
              Durchschnittliche Anzahl Sessions pro Woche
            </StyledKpiLabel>
            <StyledKpiValue>
              {avgPerWeek != null ? String(avgPerWeek) : '—'}
            </StyledKpiValue>
          </StyledKpiCard>
          {weeklyBars.length > 0 ? (
            <StyledChartContainer>
              {weeklyBars.map((value, index) => (
                <StyledBar
                  key={index}
                  heightPercent={(value / maxBar) * 100}
                >
                  {value > 0 && <StyledBarLabel>{value}</StyledBarLabel>}
                </StyledBar>
              ))}
            </StyledChartContainer>
          ) : (
            <StyledChartContainer>
              <StyledNoData>No data</StyledNoData>
            </StyledChartContainer>
          )}
        </StyledKpiSection>

        {/* Right side placeholder for TYPE filter */}
        <div />
      </StyledTopRow>

      {/* Bottom row: Session table + Calendar */}
      <StyledBottomRow>
        <StyledSection>
          <StyledSectionHeader>Sessions</StyledSectionHeader>
          {sessions.length === 0 ? (
            <StyledEmptyText>No sessions found</StyledEmptyText>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <StyledTableHeader>Date Of Session</StyledTableHeader>
                  <StyledTableHeader>Sessions Participated</StyledTableHeader>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <StyledTableCell>
                      {formatSessionDate(
                        session.sessionDatetime as string | null,
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {String(session.sessionTitle ?? '')}
                    </StyledTableCell>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </StyledSection>

        <StyledSection>
          <StyledCalendarNav>
            <StyledNavButton>&lt;</StyledNavButton>
            <span>
              {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <StyledNavButton>&gt;</StyledNavButton>
          </StyledCalendarNav>
          <StyledCalendarGrid>
            {DAY_NAMES.map((day) => (
              <StyledCalendarDayHeader key={day}>{day}</StyledCalendarDayHeader>
            ))}
            {calendarDays.map((day, index) => (
              <StyledCalendarDay
                key={index}
                hasSession={day.hasSession}
                isToday={day.isToday}
              >
                {day.day > 0 ? day.day : ''}
              </StyledCalendarDay>
            ))}
          </StyledCalendarGrid>
        </StyledSection>
      </StyledBottomRow>
    </StyledContainer>
  );
};
