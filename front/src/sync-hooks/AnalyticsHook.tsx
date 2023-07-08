import { useTrackPageView } from '@/analytics/hooks/useTrackPageView';

export function AnalyticsHook() {
  useTrackPageView();

  return <></>;
}
