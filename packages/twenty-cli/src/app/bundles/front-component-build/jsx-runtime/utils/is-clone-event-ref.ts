import { type EventRef } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';

export const isCloneEventRef = (ref: UserRef): ref is EventRef =>
  ref != null && ref._eventSource === 'clone';
