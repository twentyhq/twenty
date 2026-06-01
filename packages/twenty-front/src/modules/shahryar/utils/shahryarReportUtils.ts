export type ShahryarPaymentStatus = 'CLOSED' | 'OPEN' | 'PARTIAL';
export type ShahryarWorkingTimeStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export type ShahryarMarketReportRecord = {
  id: string;
  name: string;
  assignedSupervisorId: string;
  district: string;
  isActiveMarket: boolean;
};

export type ShahryarSupervisorReportRecord = {
  id: string;
  name: string;
};

export type ShahryarVisitReportRecord = {
  id: string;
  marketId: string;
  supervisorId: string;
  checkInAt: string;
  soldCartons: number;
  requestedCartons: number;
  report: string;
};

export type ShahryarWorkingTimeReportRecord = {
  id: string;
  supervisorId: string;
  workDate: string;
  status: ShahryarWorkingTimeStatus;
};

export type ShahryarPaymentReportRecord = {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: ShahryarPaymentStatus;
};

export type ShahryarPenaltyReportRecord = {
  id: string;
  supervisorId: string;
  amount: number;
  penaltyDate: string;
};

export type ShahryarAbsenceReportRecord = {
  id: string;
  supervisorId: string;
  absenceDate: string;
  reason: string;
};

export type ShahryarReportSourceData = {
  markets: ShahryarMarketReportRecord[];
  supervisors: ShahryarSupervisorReportRecord[];
  visits: ShahryarVisitReportRecord[];
  workingTimes: ShahryarWorkingTimeReportRecord[];
  payments: ShahryarPaymentReportRecord[];
  penalties: ShahryarPenaltyReportRecord[];
  absences: ShahryarAbsenceReportRecord[];
  backupStatus: {
    label: string;
    lastRunLabel: string;
  };
};

export type ShahryarMetric = {
  label: string;
  value: string;
  trend: string;
};

export type ShahryarReportRow = {
  period: string;
  visits: number;
  salesCartons: number;
  requests: number;
  paidAmount?: number;
  penaltyAmount?: number;
  absenceCount?: number;
  notes: string;
  primaryInsight: string;
  secondaryInsight: string;
};

export type ShahryarNotificationKind = 'missing-report' | 'missed-visit';

export type ShahryarNotification = {
  kind: ShahryarNotificationKind;
  label: string;
  count: number;
  unit: string;
  description: string;
};

export type ShahryarReportData = {
  dashboardMetrics: ShahryarMetric[];
  reportRows: ShahryarReportRow[];
  notifications: ShahryarNotification[];
};

const sameUtcDay = (date: string, referenceDate: Date) => {
  const currentDate = new Date(date);

  return (
    currentDate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    currentDate.getUTCMonth() === referenceDate.getUTCMonth() &&
    currentDate.getUTCDate() === referenceDate.getUTCDate()
  );
};

const isNonEmptyReport = (report: string) => report.trim().length > 0;

const isWithinPastDays = ({
  date,
  referenceDate,
  days,
}: {
  date: string;
  referenceDate: Date;
  days: number;
}) => {
  const currentDate = new Date(date);
  const start = new Date(referenceDate);

  start.setUTCDate(referenceDate.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(referenceDate);

  end.setUTCHours(23, 59, 59, 999);

  return currentDate >= start && currentDate <= end;
};

const isSameUtcMonth = (date: string, referenceDate: Date) => {
  const currentDate = new Date(date);

  return (
    currentDate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    currentDate.getUTCMonth() === referenceDate.getUTCMonth()
  );
};

const sumCartons = (visits: ShahryarVisitReportRecord[]) =>
  visits.reduce(
    (totals, visit) => ({
      salesCartons: totals.salesCartons + visit.soldCartons,
      requests: totals.requests + visit.requestedCartons,
    }),
    { salesCartons: 0, requests: 0 },
  );

const getSupervisorName = (
  supervisors: ShahryarSupervisorReportRecord[],
  supervisorId: string,
) =>
  supervisors.find((supervisor) => supervisor.id === supervisorId)?.name ??
  supervisorId;

const getMarketName = (
  markets: ShahryarMarketReportRecord[],
  marketId: string,
) => markets.find((market) => market.id === marketId)?.name ?? marketId;

const getBestMarketName = ({
  markets,
  visits,
}: {
  markets: ShahryarMarketReportRecord[];
  visits: ShahryarVisitReportRecord[];
}) => {
  const salesByMarketId = new Map<string, number>();

  for (const visit of visits) {
    salesByMarketId.set(
      visit.marketId,
      (salesByMarketId.get(visit.marketId) ?? 0) + visit.soldCartons,
    );
  }

  const bestMarket = [...salesByMarketId.entries()].sort(
    ([, salesCartonsA], [, salesCartonsB]) => salesCartonsB - salesCartonsA,
  )[0];

  return bestMarket === undefined ? '-' : getMarketName(markets, bestMarket[0]);
};

const getMostActiveSupervisorName = ({
  supervisors,
  visits,
}: {
  supervisors: ShahryarSupervisorReportRecord[];
  visits: ShahryarVisitReportRecord[];
}) => {
  const visitsBySupervisorId = new Map<string, number>();

  for (const visit of visits) {
    visitsBySupervisorId.set(
      visit.supervisorId,
      (visitsBySupervisorId.get(visit.supervisorId) ?? 0) + 1,
    );
  }

  const mostActiveSupervisor = [...visitsBySupervisorId.entries()].sort(
    ([, visitsA], [, visitsB]) => visitsB - visitsA,
  )[0];

  return mostActiveSupervisor === undefined
    ? '-'
    : getSupervisorName(supervisors, mostActiveSupervisor[0]);
};

const getTopDistrictName = ({
  markets,
  visits,
}: {
  markets: ShahryarMarketReportRecord[];
  visits: ShahryarVisitReportRecord[];
}) => {
  const districtSales = new Map<string, number>();

  for (const visit of visits) {
    const market = markets.find(({ id }) => id === visit.marketId);

    if (!market) {
      continue;
    }

    districtSales.set(
      market.district,
      (districtSales.get(market.district) ?? 0) + visit.soldCartons,
    );
  }

  return (
    [...districtSales.entries()].sort(
      ([, salesCartonsA], [, salesCartonsB]) => salesCartonsB - salesCartonsA,
    )[0]?.[0] ?? '-'
  );
};

const buildPeriodRow = ({
  period,
  visits,
  notes,
  primaryInsight,
  secondaryInsight,
}: {
  period: string;
  visits: ShahryarVisitReportRecord[];
  notes: string;
  primaryInsight: string;
  secondaryInsight: string;
}): ShahryarReportRow => {
  const { salesCartons, requests } = sumCartons(visits);

  return {
    period,
    visits: visits.length,
    salesCartons,
    requests,
    notes,
    primaryInsight,
    secondaryInsight,
  };
};

export const buildShahryarNotifications = ({
  data,
  referenceDate,
}: {
  data: ShahryarReportSourceData;
  referenceDate: Date;
}): ShahryarNotification[] => {
  const todaysWorkingTimes = data.workingTimes.filter(
    (workingTime) =>
      sameUtcDay(workingTime.workDate, referenceDate) &&
      workingTime.status !== 'ABSENT',
  );
  const todaysVisits = data.visits.filter((visit) =>
    sameUtcDay(visit.checkInAt, referenceDate),
  );
  const supervisorsWithReports = new Set(
    todaysVisits
      .filter((visit) => isNonEmptyReport(visit.report))
      .map((visit) => visit.supervisorId),
  );
  const activeSupervisorIds = new Set(
    todaysWorkingTimes.map((workingTime) => workingTime.supervisorId),
  );
  const missingReportCount = [...activeSupervisorIds].filter(
    (supervisorId) => !supervisorsWithReports.has(supervisorId),
  ).length;
  const visitedMarketIds = new Set(todaysVisits.map((visit) => visit.marketId));
  const missedVisitCount = data.markets.filter(
    (market) => market.isActiveMarket && !visitedMarketIds.has(market.id),
  ).length;

  return [
    {
      kind: 'missing-report',
      label: 'ڕاپۆرت نەهات',
      count: missingReportCount,
      unit: 'موشریف',
      description: 'موشریفە چالاکەکانی ئەمڕۆ کە ڕاپۆرتیان تۆمار نەکردووە.',
    },
    {
      kind: 'missed-visit',
      label: 'سەردان نەکرا',
      count: missedVisitCount,
      unit: 'مارکێت',
      description: 'مارکێتە چالاکەکان کە ئەمڕۆ هیچ سەردانێکیان نییە.',
    },
  ];
};

export const buildShahryarReportData = ({
  data,
  referenceDate,
}: {
  data: ShahryarReportSourceData;
  referenceDate: Date;
}): ShahryarReportData => {
  const todaysVisits = data.visits.filter((visit) =>
    sameUtcDay(visit.checkInAt, referenceDate),
  );
  const weeklyVisits = data.visits.filter((visit) =>
    isWithinPastDays({
      date: visit.checkInAt,
      referenceDate,
      days: 7,
    }),
  );
  const monthlyVisits = data.visits.filter((visit) =>
    isSameUtcMonth(visit.checkInAt, referenceDate),
  );
  const activeSupervisorCount = new Set(
    data.workingTimes
      .filter(
        (workingTime) =>
          sameUtcDay(workingTime.workDate, referenceDate) &&
          workingTime.status !== 'ABSENT',
      )
      .map((workingTime) => workingTime.supervisorId),
  ).size;
  const closedPaymentCount = data.payments.filter(
    (payment) => payment.status === 'CLOSED',
  ).length;
  const paymentCloseRate =
    data.payments.length === 0
      ? 0
      : Math.round((closedPaymentCount / data.payments.length) * 100);
  const weeklyPenaltyCount = data.penalties.filter((penalty) =>
    isWithinPastDays({
      date: penalty.penaltyDate,
      referenceDate,
      days: 7,
    }),
  ).length;
  const weeklyAbsenceCount = data.absences.filter((absence) =>
    isWithinPastDays({
      date: absence.absenceDate,
      referenceDate,
      days: 7,
    }),
  ).length;
  const monthlyTotals = sumCartons(monthlyVisits);

  return {
    dashboardMetrics: [
      {
        label: 'ژمارەی مارکێتەکان',
        value: String(
          data.markets.filter((market) => market.isActiveMarket).length,
        ),
        trend: 'چالاک',
      },
      {
        label: 'ژمارەی سەردانەکان',
        value: String(todaysVisits.length),
        trend: 'ئەمڕۆ',
      },
      {
        label: 'موشریفە چالاکەکان',
        value: String(activeSupervisorCount),
        trend: 'ئەمڕۆ',
      },
      {
        label: 'فرۆشتن و داواکاری',
        value: `${monthlyTotals.salesCartons}/${monthlyTotals.requests}`,
        trend: 'مانگانە',
      },
      {
        label: 'پارەدان',
        value: `${paymentCloseRate}%`,
        trend: 'ڕێژەی داخراو',
      },
      {
        label: 'غرامەی موشریفەکان',
        value: String(weeklyPenaltyCount),
        trend: 'ئەم هەفتەیە',
      },
      {
        label: 'غیابات',
        value: String(weeklyAbsenceCount),
        trend: 'ئەم هەفتەیە',
      },
      {
        label: 'باک ئەپ',
        value: data.backupStatus.label,
        trend: data.backupStatus.lastRunLabel,
      },
    ],
    reportRows: [
      buildPeriodRow({
        period: 'ڕۆژانە',
        visits: todaysVisits,
        notes: 'سەردانی ئەمڕۆ، فرۆشتن، داواکاری، تێبینی',
        primaryInsight: `${todaysVisits.length} سەردان`,
        secondaryInsight: `${sumCartons(todaysVisits).requests} داواکاری`,
      }),
      buildPeriodRow({
        period: 'هەفتانە',
        visits: weeklyVisits,
        notes: 'باشترین مارکێت، چالاکترین موشریف، پوختەی هەفتەکە',
        primaryInsight: getBestMarketName({
          markets: data.markets,
          visits: weeklyVisits,
        }),
        secondaryInsight: getMostActiveSupervisorName({
          supervisors: data.supervisors,
          visits: weeklyVisits,
        }),
      }),
      buildPeriodRow({
        period: 'مانگانە',
        visits: monthlyVisits,
        notes: 'گەشەی فرۆشتن، بەراوردی ناوچەکان، پوختەی مانگەکە',
        primaryInsight: `${monthlyTotals.salesCartons} کارتۆن`,
        secondaryInsight: getTopDistrictName({
          markets: data.markets,
          visits: monthlyVisits,
        }),
      }),
    ],
    notifications: buildShahryarNotifications({ data, referenceDate }),
  };
};
