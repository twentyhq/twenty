import { type EventRefProperties } from '@/front-component-renderer/build/jsx-runtime/types/event-ref-properties.type';
import { type RefCallback } from '@/front-component-renderer/build/jsx-runtime/types/ref-callback.type';

export type EventRef = RefCallback & EventRefProperties;
