import { type SyntheticLikeEvent } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/synthetic-like-event.type';

export const isSyntheticLikeEvent = (
  event: unknown,
): event is SyntheticLikeEvent =>
  event != null && typeof event === 'object' && 'nativeEvent' in event;
