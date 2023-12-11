import { EventData, useEventTracker } from './useEventTracker';

export const useTrackEvent = (eventType: string, eventData: EventData) => {
  const eventTracker = useEventTracker();

  return eventTracker(eventType, eventData);
};
