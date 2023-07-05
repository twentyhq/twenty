import { EventData, useEventTracker } from './useEventTracker';

export function useTrackEvent(eventType: string, eventData: EventData) {
  const eventTracker = useEventTracker();

  return eventTracker(eventType, eventData);
}
