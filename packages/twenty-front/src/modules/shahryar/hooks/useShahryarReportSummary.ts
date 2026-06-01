import { useCallback, useEffect, useState } from 'react';

import { SHAHRYAR_REPORT_DATA } from '@/shahryar/constants/shahryar-report-data';
import { fetchShahryarReportSummary } from '@/shahryar/services/shahryarReportApi';
import { type ShahryarReportApiSummary } from '@/shahryar/types/shahryarReportApi';
import {
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
    dashboardMetrics: SHAHRYAR_REPORT_DATA.dashboardMetrics,
    reportRows: SHAHRYAR_REPORT_DATA.reportRows,
    notifications: SHAHRYAR_REPORT_DATA.notifications,
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
          dashboardMetrics: mapShahryarReportSummaryToDashboardMetrics(summary),
          reportRows: mapShahryarReportSummaryToRows(summary),
          notifications: mapShahryarReportSummaryToNotifications(summary),
          isLoading: false,
        });
      } catch (error) {
        if (signal?.aborted === true) {
          return;
        }

        setState((previousState) => ({
          ...previousState,
          isLoading: false,
          errorMessage: getReportSummaryErrorMessage(error),
        }));
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
