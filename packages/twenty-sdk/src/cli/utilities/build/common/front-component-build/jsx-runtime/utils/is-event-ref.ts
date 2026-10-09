import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export const isEventRef = (ref: UserRef): ref is EventRef =>
  typeof ref === 'function' && ref._eventSource !== undefined;
