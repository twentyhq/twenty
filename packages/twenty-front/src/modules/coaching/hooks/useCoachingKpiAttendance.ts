import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

const KPI_ATTENDANCE_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  wpUserId: true,
  email: true,
  trendThirtyDays: true,
  sessionsThismonth: true,
  sessionsPreviousmonth: true,
  sessionsPerWeekThismonth: true,
  sessionsPerWeekPreviousmonth: true,
  weeksSinceStart: true,
  daysSinceStart: true,
  avgSessionsPerday: true,
  avgMaxSessionsOneday: true,
  avgRecoveryDays: true,
  sessionsRecentWeeks: true,
  sessionsPreviousPeriod: true,
  monthlyTotalSessions: true,
  monthlyAvgSessionsPerWeek: true,
};

export const useCoachingKpiAttendance = (
  email: string | null,
  wpUserId: string | null,
) => {
  const filter =
    email || wpUserId
      ? {
          or: [
            ...(email ? [{ email: { eq: email } }] : []),
            ...(wpUserId ? [{ wpUserId: { eq: wpUserId } }] : []),
          ],
        }
      : undefined;

  const { records, loading } = useFindManyRecords({
    objectNameSingular: 'tobKpiSessionAttendance',
    filter,
    recordGqlFields: KPI_ATTENDANCE_GQL_FIELDS,
    limit: 1,
    skip: !email && !wpUserId,
  });

  return { kpi: records[0] ?? null, loading };
};
