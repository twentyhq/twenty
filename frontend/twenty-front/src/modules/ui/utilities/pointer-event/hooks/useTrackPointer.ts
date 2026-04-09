import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useCallback, useEffect } from 'react';

export const useTrackPointer = ({
  shouldTrackPointer = true,
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: {
  shouldTrackPointer?: boolean;
  onMouseMove?: PointerEventListener;
  onMouseDown?: PointerEventListener;
  onMouseUp?: PointerEventListener;
}) => {
  const extractPosition = useCallback((event: MouseEvent | TouchEvent) => {
    const clientX =
      'clientX' in event ? event.clientX : event.changedTouches[0].clientX;
    const clientY =
      'clientY' in event ? event.clientY : event.changedTouches[0].clientY;

    return { clientX, clientY };
  }, []);

  const onInternalMouseMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = extractPosition(event);
      onMouseMove?.({ x: clientX, y: clientY, event });
    },
    [onMouseMove, extractPosition],
  );

  const onInternalMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = extractPosition(event);
      onMouseDown?.({ x: clientX, y: clientY, event });
    },
    [onMouseDown, extractPosition],
  );

  const onInternalMouseUp = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = extractPosition(event);
      onMouseUp?.({ x: clientX, y: clientY, event });
    },
    [onMouseUp, extractPosition],
  );

  useEffect(() => {
    if (shouldTrackPointer) {
      document.addEventListener('mousemove', onInternalMouseMove);
      document.addEventListener('mousedown', onInternalMouseDown);
      document.addEventListener('mouseup', onInternalMouseUp);

      return () => {
        document.removeEventListener('mousemove', onInternalMouseMove);
        document.removeEventListener('mousedown', onInternalMouseDown);
        document.removeEventListener('mouseup', onInternalMouseUp);
      };
    }
  }, [
    shouldTrackPointer,
    onInternalMouseMove,
    onInternalMouseDown,
    onInternalMouseUp,
  ]);
};
