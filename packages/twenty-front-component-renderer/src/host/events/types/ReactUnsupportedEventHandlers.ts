import { type ReactUnsupportedEventType } from '@/host/events/types/ReactUnsupportedEventType';

export type ReactUnsupportedEventHandlers = Partial<
  Record<ReactUnsupportedEventType, (event: Event) => void>
>;
