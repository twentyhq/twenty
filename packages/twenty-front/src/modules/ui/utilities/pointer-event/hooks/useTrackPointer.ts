import { useCallback, useEffect } from 'react';

type MouseListener = (positionX: number, positionY: number) => void;

export const useTrackPointer = ({
  shouldTrackPointer = true,
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: {
  shouldTrackPointer?: boolean;
  onMouseMove?: MouseListener;
  onMouseDown?: MouseListener;
  onMouseUp?: MouseListener;
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
      onMouseMove?.(clientX, clientY);
    },
    [onMouseMove, extractPosition],
  );

  const onInternalMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = extractPosition(event);
      onMouseDown?.(clientX, clientY);
    },
    [onMouseDown, extractPosition],
  );

  const onInternalMouseUp = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = extractPosition(event);
      onMouseUp?.(clientX, clientY);
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
