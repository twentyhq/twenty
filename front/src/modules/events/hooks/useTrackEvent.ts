import { useEventTracker } from './useEventTracker';

export function useTrackEvent(eventType: string, eventData: any) {
  const eventTracker = useEventTracker();

  return eventTracker(eventType, eventData);
}
