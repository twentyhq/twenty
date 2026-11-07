import { type EventScrollState } from '@/polyfills/scroll/types/EventScrollState';
import { type ScrollAxis } from '@/types/ScrollAxis';

export const SCROLL_OFFSET_PROPERTY_BY_AXIS = {
  top: 'scrollTop',
  left: 'scrollLeft',
} as const satisfies Record<ScrollAxis, keyof EventScrollState>;
