import { type SerializedEventData } from '@/types/SerializedEventData';

export type EventScrollState = Pick<
  SerializedEventData,
  'scrollTop' | 'scrollLeft' | 'scrollWidth' | 'clientWidth'
>;
