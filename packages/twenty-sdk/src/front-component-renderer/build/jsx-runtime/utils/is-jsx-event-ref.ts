import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export const isJsxEventRef = (ref: UserRef): ref is EventRef =>
  ref != null && ref._eventSource === 'jsx';
