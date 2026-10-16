import { type EventHandlersBySource } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-source.type';

export type EventListenerEntry = {
  type: string;
  capture: boolean;
  handlersBySource: EventHandlersBySource;
  listener: (this: unknown, event: Event) => void;
};
