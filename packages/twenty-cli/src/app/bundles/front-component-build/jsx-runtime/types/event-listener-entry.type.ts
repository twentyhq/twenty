import { type EventHandlersBySource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-source.type';

export type EventListenerEntry = {
  type: string;
  capture: boolean;
  handlersBySource: EventHandlersBySource;
  listener: (this: unknown, event: Event) => void;
};
