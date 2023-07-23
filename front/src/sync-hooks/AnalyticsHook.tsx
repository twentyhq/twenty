import { useTrackPageView } from '@/analytics/hooks/useTrackPageView';

export function AnalyticsHook() {
  console.log('AnalyticsHook');
  useTrackPageView();

  return <></>;
}
