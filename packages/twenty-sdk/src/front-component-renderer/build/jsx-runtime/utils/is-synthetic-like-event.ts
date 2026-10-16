import { type SyntheticLikeEvent } from '@/front-component-renderer/build/jsx-runtime/types/synthetic-like-event.type';

export const isSyntheticLikeEvent = (
  event: unknown,
): event is SyntheticLikeEvent =>
  event != null && typeof event === 'object' && 'nativeEvent' in event;
