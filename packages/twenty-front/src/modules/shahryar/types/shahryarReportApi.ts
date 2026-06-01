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
};
