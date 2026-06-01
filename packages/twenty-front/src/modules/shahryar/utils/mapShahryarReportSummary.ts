import {
  type ShahryarReportApiPeriod,
  type ShahryarReportApiSummary,
} from '@/shahryar/types/shahryarReportApi';
import {
  type ShahryarMetric,
  type ShahryarNotification,
  type ShahryarNotificationKind,
  type ShahryarReportRow,
} from '@/shahryar/utils/shahryarReportUtils';

const PERIOD_LABELS: Record<ShahryarReportApiPeriod, string> = {
  daily: 'ڕۆژانە',
  weekly: 'هەفتانە',
  monthly: 'مانگانە',
};

export const mapShahryarReportSummaryToRows = (
  summary: ShahryarReportApiSummary,
): ShahryarReportRow[] =>
  summary.rows.map((row) => ({
    period: PERIOD_LABELS[row.period],
    visits: row.visits,
    salesCartons: row.salesCartons,
    requests: row.requestedCartons,
    paidAmount: row.paidAmount,
    penaltyAmount: row.penaltyAmount,
    absenceCount: row.absenceCount,
    primaryInsight: row.primaryInsight,
    secondaryInsight: row.secondaryInsight,
    notes: row.notes.length === 0 ? '-' : row.notes.join('، '),
  }));

const formatAmount = (amount: number) => amount.toLocaleString('en-US');

const getPeriodRow = (
  summary: ShahryarReportApiSummary,
  period: ShahryarReportApiPeriod,
) => summary.rows.find((row) => row.period === period);

export const mapShahryarReportSummaryToDashboardMetrics = (
  summary: ShahryarReportApiSummary,
): ShahryarMetric[] => {
  const dailyRow = getPeriodRow(summary, 'daily');
  const monthlyRow = getPeriodRow(summary, 'monthly');

  return [
    {
      label: 'ژمارەی مارکێتەکان',
      value: String(summary.activeMarketCount),
      trend: 'چالاک',
    },
    {
      label: 'ژمارەی سەردانەکان',
      value: String(dailyRow?.visits ?? 0),
      trend: 'ئەمڕۆ',
    },
    {
      label: 'موشریفە چالاکەکان',
      value: String(summary.activeSupervisorCount),
      trend: 'ئەمڕۆ',
    },
    {
      label: 'فرۆشتن و داواکاری',
      value: `${monthlyRow?.salesCartons ?? 0}/${
        monthlyRow?.requestedCartons ?? 0
      }`,
      trend: 'مانگانە',
    },
    {
      label: 'پارەدان',
      value: formatAmount(summary.totalPaidAmount),
      trend: 'کۆی پارەدان',
    },
    {
      label: 'غرامەی موشریفەکان',
      value: formatAmount(summary.totalPenaltyAmount),
      trend: 'کۆی غرامە',
    },
    {
      label: 'غیابات',
      value: String(summary.totalAbsences),
      trend: 'کۆی غیاب',
    },
    {
      label: 'باک ئەپ',
      value: summary.backupStatus.label,
      trend: summary.backupStatus.lastRunLabel,
    },
  ];
};

const NOTIFICATION_DISPLAY: Record<
  ShahryarNotificationKind,
  Pick<ShahryarNotification, 'label' | 'unit' | 'description'>
> = {
  'missing-report': {
    label: 'ڕاپۆرت نەهات',
    unit: 'موشریف',
    description: 'موشریفە چالاکەکانی ئەمڕۆ کە ڕاپۆرتیان تۆمار نەکردووە.',
  },
  'missed-visit': {
    label: 'سەردان نەکرا',
    unit: 'مارکێت',
    description: 'مارکێتە چالاکەکان کە ئەمڕۆ هیچ سەردانێکیان نییە.',
  },
};

export const mapShahryarReportSummaryToNotifications = (
  summary: ShahryarReportApiSummary,
): ShahryarNotification[] =>
  (Object.keys(NOTIFICATION_DISPLAY) as ShahryarNotificationKind[]).map(
    (kind) => ({
      kind,
      count: summary.notifications.filter(
        (notification) => notification.kind === kind,
      ).length,
      ...NOTIFICATION_DISPLAY[kind],
    }),
  );
