import { type ShahryarReportApiSummary } from '@/shahryar/types/shahryarReportApi';
import {
  mapShahryarReportSummaryToDashboardMetrics,
  mapShahryarReportSummaryToNotifications,
  mapShahryarReportSummaryToRows,
} from '@/shahryar/utils/mapShahryarReportSummary';

const summary: ShahryarReportApiSummary = {
  referenceDate: '2026-06-01',
  activeMarketCount: 4,
  activeSupervisorCount: 3,
  totalVisits: 2,
  totalSalesCartons: 12,
  totalRequestedCartons: 20,
  totalPaidAmount: 250000,
  totalPenaltyAmount: 10000,
  totalAbsences: 1,
  backupStatus: {
    label: 'Healthy',
    lastRunLabel: '2026-06-01 02:15 UTC',
  },
  rows: [
    {
      period: 'daily',
      label: '2026-06-01',
      visits: 2,
      salesCartons: 12,
      requestedCartons: 20,
      paidAmount: 250000,
      penaltyAmount: 10000,
      absenceCount: 0,
      primaryInsight: '2 visits across 4 active markets',
      secondaryInsight: '3 active supervisors, 20 requested cartons',
      notes: ['مارکێتی ئارام: قەرز'],
    },
    {
      period: 'weekly',
      label: 'Last 7 days',
      visits: 3,
      salesCartons: 18,
      requestedCartons: 24,
      paidAmount: 430000,
      penaltyAmount: 10000,
      absenceCount: 1,
      primaryInsight: '3 visits across 4 active markets',
      secondaryInsight: '3 active supervisors, 24 requested cartons',
      notes: [],
    },
    {
      period: 'monthly',
      label: '2026-06',
      visits: 3,
      salesCartons: 18,
      requestedCartons: 24,
      paidAmount: 430000,
      penaltyAmount: 10000,
      absenceCount: 1,
      primaryInsight: '18 cartons',
      secondaryInsight: 'North',
      notes: [],
    },
  ],
  notifications: [
    {
      id: 'missing-report-supervisor-2',
      kind: 'missing-report',
      severity: 'warning',
      supervisorId: 'supervisor-2',
      supervisorName: 'Halo',
      message: 'Missing report',
    },
    {
      id: 'missed-visit-market-4',
      kind: 'missed-visit',
      severity: 'critical',
      supervisorId: 'supervisor-3',
      supervisorName: 'Behroz',
      marketId: 'market-4',
      marketName: 'New Market',
      message: 'Missed visit',
    },
  ],
};

describe('mapShahryarReportSummary', () => {
  it('maps backend report rows to Sorani display rows', () => {
    expect(mapShahryarReportSummaryToRows(summary)).toEqual([
      {
        period: 'ڕۆژانە',
        visits: 2,
        salesCartons: 12,
        requests: 20,
        paidAmount: 250000,
        penaltyAmount: 10000,
        absenceCount: 0,
        primaryInsight: '2 visits across 4 active markets',
        secondaryInsight: '3 active supervisors, 20 requested cartons',
        notes: 'مارکێتی ئارام: قەرز',
      },
      {
        period: 'هەفتانە',
        visits: 3,
        salesCartons: 18,
        requests: 24,
        paidAmount: 430000,
        penaltyAmount: 10000,
        absenceCount: 1,
        primaryInsight: '3 visits across 4 active markets',
        secondaryInsight: '3 active supervisors, 24 requested cartons',
        notes: '-',
      },
      {
        period: 'مانگانە',
        visits: 3,
        salesCartons: 18,
        requests: 24,
        paidAmount: 430000,
        penaltyAmount: 10000,
        absenceCount: 1,
        primaryInsight: '18 cartons',
        secondaryInsight: 'North',
        notes: '-',
      },
    ]);
  });

  it('maps backend report totals to dashboard metrics', () => {
    expect(mapShahryarReportSummaryToDashboardMetrics(summary)).toEqual(
      expect.arrayContaining([
        { label: 'ژمارەی مارکێتەکان', value: '4', trend: 'چالاک' },
        { label: 'ژمارەی سەردانەکان', value: '2', trend: 'ئەمڕۆ' },
        { label: 'موشریفە چالاکەکان', value: '3', trend: 'ئەمڕۆ' },
        { label: 'فرۆشتن و داواکاری', value: '18/24', trend: 'مانگانە' },
        { label: 'پارەدان', value: '250,000', trend: 'کۆی پارەدان' },
        {
          label: 'غرامەی موشریفەکان',
          value: '10,000',
          trend: 'کۆی غرامە',
        },
        { label: 'غیابات', value: '1', trend: 'کۆی غیاب' },
        {
          label: 'باک ئەپ',
          value: 'Healthy',
          trend: '2026-06-01 02:15 UTC',
        },
      ]),
    );
  });

  it('aggregates backend notifications by Shahryar alert kind', () => {
    expect(mapShahryarReportSummaryToNotifications(summary)).toEqual([
      expect.objectContaining({
        kind: 'missing-report',
        label: 'ڕاپۆرت نەهات',
        count: 1,
        unit: 'موشریف',
      }),
      expect.objectContaining({
        kind: 'missed-visit',
        label: 'سەردان نەکرا',
        count: 1,
        unit: 'مارکێت',
      }),
    ]);
  });
});
