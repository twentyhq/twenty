import { useCallback, useEffect, useState } from 'react';
import { type Layouts } from 'react-grid-layout';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  ALL_WIDGET_IDS,
  DEFAULT_LAYOUTS,
  type WidgetId,
} from '@/propel/lib/dashboardConfig';
import {
  type AnalyticsRange,
  type DashboardLayoutGetResponse,
  type MarketingAnalyticsPayload,
  type MarketingHubPayload,
  type PersistedDashboardLayout,
} from '@/propel/types/marketingHome';

// Loads the three data sources the Marketing Home hero needs and owns the
// persisted-layout lifecycle:
//   • POST /s/marketing/analytics  (re-fetched when the range changes)
//   • POST /s/marketing/hub
//   • POST /s/marketing/dashboard-layout { op:'get' } on mount → null falls back
//     to DEFAULT_LAYOUTS; { op:'set' } persists on save.
//
// Everything fails soft: a null route response leaves the relevant payload null
// (the widgets render their honest empty states) and never throws.

const isValidWidgetId = (id: string): id is WidgetId =>
  (ALL_WIDGET_IDS as string[]).includes(id);

export const useMarketingDashboardData = (range: AnalyticsRange) => {
  const [analytics, setAnalytics] = useState<MarketingAnalyticsPayload | null>(
    null,
  );
  const [hub, setHub] = useState<MarketingHubPayload | null>(null);
  const [layouts, setLayouts] = useState<Layouts>(DEFAULT_LAYOUTS);
  const [enabledWidgetIds, setEnabledWidgetIds] =
    useState<WidgetId[]>(ALL_WIDGET_IDS);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Analytics — refetched on range change.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void callPropelRoute<MarketingAnalyticsPayload>('/marketing/analytics', {
      range,
    }).then((payload) => {
      if (!active) return;
      setAnalytics(payload);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [range]);

  // Hub — fetched once on mount.
  useEffect(() => {
    let active = true;
    void callPropelRoute<MarketingHubPayload>('/marketing/hub', {}).then(
      (payload) => {
        if (active) setHub(payload);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  // Persisted layout — fetched once on mount; null → keep DEFAULT_LAYOUTS.
  useEffect(() => {
    let active = true;
    void callPropelRoute<DashboardLayoutGetResponse>(
      '/marketing/dashboard-layout',
      { op: 'get' },
    ).then((res) => {
      if (!active) return;
      const persisted = res?.layouts ?? null;
      if (
        persisted != null &&
        typeof persisted === 'object' &&
        'layouts' in persisted
      ) {
        const stored = persisted as PersistedDashboardLayout;
        if (stored.layouts != null) {
          setLayouts(stored.layouts);
        }
        if (Array.isArray(stored.enabledWidgetIds)) {
          const valid = stored.enabledWidgetIds.filter(isValidWidgetId);
          if (valid.length > 0) setEnabledWidgetIds(valid);
        }
      }
      setLayoutLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist the current arrangement (called on "Done"). Fire-and-forget — a
  // failed save just means the next load falls back to whatever was last stored.
  const persistLayout = useCallback(
    (nextLayouts: Layouts, nextEnabled: WidgetId[]) => {
      void callPropelRoute('/marketing/dashboard-layout', {
        op: 'set',
        layouts: {
          layouts: nextLayouts,
          enabledWidgetIds: nextEnabled,
        } satisfies PersistedDashboardLayout,
      });
    },
    [],
  );

  return {
    analytics,
    hub,
    layouts,
    setLayouts,
    enabledWidgetIds,
    setEnabledWidgetIds,
    isLoading,
    layoutLoaded,
    persistLayout,
  };
};
