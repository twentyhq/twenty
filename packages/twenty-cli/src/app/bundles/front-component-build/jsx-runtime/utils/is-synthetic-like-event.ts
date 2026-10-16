import { type SyntheticLikeEvent } from '@/app/bundles/front-component-build/jsx-runtime/types/synthetic-like-event.type';

export const isSyntheticLikeEvent = (
  event: unknown,
): event is SyntheticLikeEvent =>
  event != null && typeof event === 'object' && 'nativeEvent' in event;
