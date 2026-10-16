import { type EventRefProperties } from '@/front-component-renderer/build/jsx-runtime/types/event-ref-properties.type';
import { type RefCallback } from '@/front-component-renderer/build/jsx-runtime/types/ref-callback.type';

type RefObject = {
  current: unknown;
};

export type UserRef =
  | ((RefCallback | RefObject) & Partial<EventRefProperties>)
  | null
  | undefined;
