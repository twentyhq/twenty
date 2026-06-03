import { useCallback, useEffect, useState } from 'react';

import { fetchShahryarReportSummary } from '@/shahryar/services/shahryarReportApi';
import {
  type ShahryarReportApiAnalytics,
  type ShahryarReportApiSummary,
} from '@/shahryar/types/shahryarReportApi';
import {
  mapShahryarReportSummaryToAnalytics,
  mapShahryarReportSummaryToDashboardMetrics,
  mapShahryarReportSummaryToNotifications,
  mapShahryarReportSummaryToRows,
} from '@/shahryar/utils/mapShahryarReportSummary';
import {
  type ShahryarMetric,
  type ShahryarNotification,
  type ShahryarReportRow,
} from '@/shahryar/utils/shahryarReportUtils';

type ShahryarReportSummaryState = {
  summary?: ShahryarReportApiSummary;
  analytics?: ShahryarReportApiAnalytics;
  dashboardMetrics: ShahryarMetric[];
  reportRows: ShahryarReportRow[];
  notifications: ShahryarNotification[];
  isLoading: boolean;
  errorMessage?: string;
};

const getReportSummaryErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Unable to fetch Shahryar report summary';

export const useShahryarReportSummary = () => {
  const [state, setState] = useState<ShahryarReportSummaryState>({
    dashboardMetrics: [],
    reportRows: [],
    notifications: [],
    isLoading: true,
  });

  const refresh = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      setState((previousState) => ({
        ...previousState,
        isLoading: true,
        errorMessage: undefined,
      }));

      try {
        const summary = await fetchShahryarReportSummary({ signal });

        if (signal?.aborted === true) {
          return;
        }

        setState({
          summary,
          analytics: mapShahryarReportSummaryToAnalytics(summary),
          dashboardMetrics: mapShahryarReportSummaryToDashboardMetrics(summary),
          reportRows: mapShahryarReportSummaryToRows(summary),
          notifications: mapShahryarReportSummaryToNotifications(summary),
          isLoading: false,
        });
      } catch (error) {
        if (signal?.aborted === true) {
          return;
        }

        setState({
          dashboardMetrics: [],
          reportRows: [],
          notifications: [],
          isLoading: false,
          summary: undefined,
          analytics: undefined,
          errorMessage: getReportSummaryErrorMessage(error),
        });
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void refresh({ signal: controller.signal });

    return () => controller.abort();
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
};
