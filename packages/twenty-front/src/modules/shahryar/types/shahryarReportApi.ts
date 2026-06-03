export type ShahryarReportApiPeriod = 'daily' | 'weekly' | 'monthly';

export type ShahryarReportApiNotificationKind =
  | 'missing-report'
  | 'missed-visit';

export type ShahryarReportApiNotificationSeverity = 'warning' | 'critical';

export type ShahryarReportApiRow = {
  period: ShahryarReportApiPeriod;
  label: string;
  visits: number;
  salesCartons: number;
  requestedCartons: number;
  paidAmount: number;
  penaltyAmount: number;
  absenceCount: number;
  primaryInsight: string;
  secondaryInsight: string;
  notes: string[];
};

export type ShahryarReportApiNotification = {
  id: string;
  kind: ShahryarReportApiNotificationKind;
  severity: ShahryarReportApiNotificationSeverity;
  supervisorId: string;
  supervisorName: string;
  marketId?: string;
  marketName?: string;
  message: string;
};

export type ShahryarReportApiRankedMetric = {
  id: string;
  label: string;
  value: number;
  secondaryLabel: string;
  secondaryValue: number;
};

export type ShahryarReportApiDistrictComparison = {
  district: string;
  activeMarketCount: number;
  visitCount: number;
  salesCartons: number;
  paidAmount: number;
};

export type ShahryarReportApiTrendPoint = {
  date: string;
  label: string;
  visits: number;
  salesCartons: number;
  requestedCartons: number;
  paidAmount: number;
};

export type ShahryarReportApiMonthlyGrowth = {
  currentMonthSalesCartons: number;
  previousMonthSalesCartons: number;
  salesGrowthPercent: number;
  currentMonthPaidAmount: number;
  previousMonthPaidAmount: number;
  paymentGrowthPercent: number;
};

export type ShahryarReportApiAnalytics = {
  bestMarkets: ShahryarReportApiRankedMetric[];
  mostActiveSupervisors: ShahryarReportApiRankedMetric[];
  districtComparisons: ShahryarReportApiDistrictComparison[];
  salesPaymentTrend: ShahryarReportApiTrendPoint[];
  monthlyGrowth: ShahryarReportApiMonthlyGrowth;
};

export type ShahryarReportApiSummary = {
  referenceDate: string;
  activeMarketCount: number;
  activeSupervisorCount: number;
  totalVisits: number;
  totalSalesCartons: number;
  totalRequestedCartons: number;
  totalPaidAmount: number;
  totalPenaltyAmount: number;
  totalAbsences: number;
  backupStatus: {
    label: string;
    lastRunLabel: string;
  };
  rows: ShahryarReportApiRow[];
  notifications: ShahryarReportApiNotification[];
  analytics: ShahryarReportApiAnalytics;
};
