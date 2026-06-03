import { renderHook, waitFor } from '@testing-library/react';

import { fetchShahryarReportSummary } from '@/shahryar/services/shahryarReportApi';
import { type ShahryarReportApiSummary } from '@/shahryar/types/shahryarReportApi';
import { useShahryarReportSummary } from '@/shahryar/hooks/useShahryarReportSummary';

jest.mock('@/shahryar/services/shahryarReportApi', () => ({
  fetchShahryarReportSummary: jest.fn(),
}));

const summary: ShahryarReportApiSummary = {
  referenceDate: '2026-06-01',
  activeMarketCount: 1,
  activeSupervisorCount: 1,
  totalVisits: 1,
  totalSalesCartons: 12,
  totalRequestedCartons: 4,
  totalPaidAmount: 250000,
  totalPenaltyAmount: 0,
  totalAbsences: 0,
  backupStatus: {
    label: 'Healthy',
    lastRunLabel: '2026-06-01 02:15 UTC',
  },
  rows: [
    {
      period: 'daily',
      label: '2026-06-01',
      visits: 1,
      salesCartons: 12,
      requestedCartons: 4,
      paidAmount: 250000,
      penaltyAmount: 0,
      absenceCount: 0,
      primaryInsight: '1 visit',
      secondaryInsight: '4 requested cartons',
      notes: [],
    },
  ],
  notifications: [],
  analytics: {
    bestMarkets: [
      {
        id: 'market-1',
        label: 'Center Market',
        value: 12,
        secondaryLabel: 'visits',
        secondaryValue: 1,
      },
    ],
    mostActiveSupervisors: [],
    districtComparisons: [],
    salesPaymentTrend: [],
    monthlyGrowth: {
      currentMonthSalesCartons: 12,
      previousMonthSalesCartons: 0,
      salesGrowthPercent: 100,
      currentMonthPaidAmount: 250000,
      previousMonthPaidAmount: 0,
      paymentGrowthPercent: 100,
    },
  },
};

const fetchShahryarReportSummaryMock = jest.mocked(fetchShahryarReportSummary);

describe('useShahryarReportSummary', () => {
  beforeEach(() => {
    fetchShahryarReportSummaryMock.mockReset();
  });

  it('should expose live summary analytics after a successful fetch', async () => {
    fetchShahryarReportSummaryMock.mockResolvedValueOnce(summary);

    const { result } = renderHook(() => useShahryarReportSummary());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analytics).toBe(summary.analytics);
    expect(result.current.dashboardMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'ژمارەی مارکێتەکان',
          value: '1',
        }),
      ]),
    );
    expect(result.current.reportRows).toEqual([
      expect.objectContaining({
        period: 'ڕۆژانە',
        salesCartons: 12,
      }),
    ]);
  });

  it('should not keep demo report rows after a failed fetch', async () => {
    fetchShahryarReportSummaryMock.mockRejectedValueOnce(
      new Error('server unavailable'),
    );

    const { result } = renderHook(() => useShahryarReportSummary());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.analytics).toBeUndefined();
    expect(result.current.dashboardMetrics).toEqual([]);
    expect(result.current.reportRows).toEqual([]);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.errorMessage).toBe('server unavailable');
  });
});
