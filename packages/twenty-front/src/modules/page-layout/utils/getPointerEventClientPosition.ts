import { isDefined } from 'twenty-shared/utils';

// react-grid-layout v2 types drag events as plain Event; at runtime they are
// the native MouseEvent or TouchEvent coming from react-draggable.
export const getPointerEventClientPosition = (
  event: Event,
): { clientX: number; clientY: number } | null => {
  if (event instanceof MouseEvent) {
    return { clientX: event.clientX, clientY: event.clientY };
  }

  const touch = (event as Partial<TouchEvent>).changedTouches?.[0];

  if (isDefined(touch)) {
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  return null;
};
