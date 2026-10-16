import { type EventRefProperties } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref-properties.type';
import { type RefCallback } from '@/app/bundles/front-component-build/jsx-runtime/types/ref-callback.type';

type RefObject = {
  current: unknown;
};

export type UserRef =
  | ((RefCallback | RefObject) & Partial<EventRefProperties>)
  | null
  | undefined;
