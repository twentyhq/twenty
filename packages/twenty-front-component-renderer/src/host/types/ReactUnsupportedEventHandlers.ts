import { type ReactUnsupportedEventType } from '@/host/types/ReactUnsupportedEventType';

export type ReactUnsupportedEventHandlers = Partial<
  Record<ReactUnsupportedEventType, (event: Event) => void>
>;
