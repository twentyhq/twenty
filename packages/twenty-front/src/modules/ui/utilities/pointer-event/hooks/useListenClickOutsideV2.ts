import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';
import React, { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';

export enum ClickOutsideMode {
  comparePixels = 'comparePixels',
  compareHTMLRef = 'compareHTMLRef',
}

export type ClickOutsideListenerProps<T extends Element> = {
  refs: Array<React.RefObject<T>>;
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
  listenerId: string;
  enabled?: boolean;
};

export const useListenClickOutsideV2 = <T extends Element>({
  refs,
  callback,
  mode = ClickOutsideMode.compareHTMLRef,
  listenerId,
  enabled = true,
}: ClickOutsideListenerProps<T>) => {
  const {
    getClickOutsideListenerIsMouseDownInsideState,
    getClickOutsideListenerIsActivatedState,
  } = useClickOustideListenerStates(listenerId);

  const [isInitialMount, setIsInitialMount] = useState(true);
  const [justProcessedTouchEvent, setJustProcessedTouchEvent] = useState(false);

  const handleInteraction = useRecoilCallback(
    ({ snapshot, set }) =>
      (event: MouseEvent | TouchEvent) => {
        const clickOutsideListenerIsActivated = snapshot
          .getLoadable(getClickOutsideListenerIsActivatedState)
          .getValue();

        const isListening = clickOutsideListenerIsActivated && enabled;
        if (!isListening) return;

        if (isInitialMount) {
          setIsInitialMount(false);
          return;
        }

        let clientX: number, clientY: number;

        if ('touches' in event && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
          setJustProcessedTouchEvent(true);
        } else if ('clientX' in event && 'clientY' in event) {
          clientX = event.clientX;
          clientY = event.clientY;
          if (justProcessedTouchEvent) {
            setJustProcessedTouchEvent(false);
            return;
          }
        } else {
          return;
        }

        const clickedOnAtLeastOneRef = refs.some((ref) => {
          if (!ref.current) return false;

          if (mode === ClickOutsideMode.compareHTMLRef) {
            return ref.current.contains(event.target as Node);
          }

          if (mode === ClickOutsideMode.comparePixels) {
            const { left, top, right, bottom } =
              ref.current.getBoundingClientRect();
            return (
              clientX >= left &&
              clientX <= right &&
              clientY >= top &&
              clientY <= bottom
            );
          }
          return false;
        });

        if (event.type === 'mousedown' || event.type === 'touchstart') {
          set(
            getClickOutsideListenerIsMouseDownInsideState,
            clickedOnAtLeastOneRef,
          );
        }

        if (event.type === 'click' || event.type === 'touchend') {
          const isMouseDownInside = snapshot
            .getLoadable(getClickOutsideListenerIsMouseDownInsideState)
            .getValue();

          if (!clickedOnAtLeastOneRef && !isMouseDownInside) {
            callback(event);
          }
        }
      },
    [
      refs,
      callback,
      mode,
      getClickOutsideListenerIsMouseDownInsideState,
      enabled,
      getClickOutsideListenerIsActivatedState,
      isInitialMount,
      justProcessedTouchEvent,
    ],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleInteraction, {
      capture: true,
    });
    document.addEventListener('click', handleInteraction, { capture: true });
    document.addEventListener('touchstart', handleInteraction, {
      capture: true,
    });
    document.addEventListener('touchend', handleInteraction, { capture: true });

    return () => {
      document.removeEventListener('mousedown', handleInteraction, {
        capture: true,
      });
      document.removeEventListener('click', handleInteraction, {
        capture: true,
      });
      document.removeEventListener('touchstart', handleInteraction, {
        capture: true,
      });
      document.removeEventListener('touchend', handleInteraction, {
        capture: true,
      });
    };
  }, [handleInteraction]);
};
