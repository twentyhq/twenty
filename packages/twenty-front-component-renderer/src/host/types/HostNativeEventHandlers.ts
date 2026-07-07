import { type HostNativeEventType } from '@/host/types/HostNativeEventType';

export type HostNativeEventHandlers = Partial<
  Record<HostNativeEventType, (event: Event) => void>
>;
