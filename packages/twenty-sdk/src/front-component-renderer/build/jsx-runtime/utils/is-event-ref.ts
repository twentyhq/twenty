import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export const isEventRef = (ref: UserRef): ref is EventRef =>
  typeof ref === 'function' && ref._eventSource !== undefined;
