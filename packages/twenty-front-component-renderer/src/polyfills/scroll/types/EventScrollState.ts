import { type EVENT_SCROLL_STATE_KEYS } from '@/constants/EventScrollStateKeys';
import { type SerializedEventData } from '@/types/SerializedEventData';

export type EventScrollState = Pick<
  SerializedEventData,
  (typeof EVENT_SCROLL_STATE_KEYS)[number]
>;
