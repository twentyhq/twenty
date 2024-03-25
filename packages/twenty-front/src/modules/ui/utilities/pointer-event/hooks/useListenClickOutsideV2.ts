import React, { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';

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

  const handleMouseDown = useRecoilCallback(
    ({ snapshot, set }) =>
      (event: MouseEvent | TouchEvent) => {
        const clickOutsideListenerIsActivated = snapshot
          .getLoadable(getClickOutsideListenerIsActivatedState)
          .getValue();

        const isListening = clickOutsideListenerIsActivated && enabled;

        if (!isListening) {
          return;
        }

        if (mode === ClickOutsideMode.compareHTMLRef) {
          const clickedOnAtLeastOneRef = refs
            .filter((ref) => !!ref.current)
            .some((ref) => ref.current?.contains(event.target as Node));

          set(
            getClickOutsideListenerIsMouseDownInsideState,
            clickedOnAtLeastOneRef,
          );
        }

        if (mode === ClickOutsideMode.comparePixels) {
          const clickedOnAtLeastOneRef = refs
            .filter((ref) => !!ref.current)
            .some((ref) => {
              if (!ref.current) {
                return false;
              }

              const { x, y, width, height } =
                ref.current.getBoundingClientRect();

              const clientX =
                'clientX' in event
                  ? event.clientX
                  : event.changedTouches[0].clientX;
              const clientY =
                'clientY' in event
                  ? event.clientY
                  : event.changedTouches[0].clientY;

              if (
                clientX < x ||
                clientX > x + width ||
                clientY < y ||
                clientY > y + height
              ) {
                return false;
              }
              return true;
            });

          set(
            getClickOutsideListenerIsMouseDownInsideState,
            clickedOnAtLeastOneRef,
          );
        }
      },
    [
      mode,
      refs,
      getClickOutsideListenerIsMouseDownInsideState,
      enabled,
      getClickOutsideListenerIsActivatedState,
    ],
  );

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const isMouseDownInside = snapshot
          .getLoadable(getClickOutsideListenerIsMouseDownInsideState)
          .getValue();

        if (mode === ClickOutsideMode.compareHTMLRef) {
          const clickedOnAtLeastOneRef = refs
            .filter((ref) => !!ref.current)
            .some((ref) => ref.current?.contains(event.target as Node));

          if (!clickedOnAtLeastOneRef && !isMouseDownInside) {
            callback(event);
          }
        }

        if (mode === ClickOutsideMode.comparePixels) {
          const clickedOnAtLeastOneRef = refs
            .filter((ref) => !!ref.current)
            .some((ref) => {
              if (!ref.current) {
                return false;
              }

              const { x, y, width, height } =
                ref.current.getBoundingClientRect();

              const clientX =
                'clientX' in event
                  ? event.clientX
                  : event.changedTouches[0].clientX;
              const clientY =
                'clientY' in event
                  ? event.clientY
                  : event.changedTouches[0].clientY;

              if (
                clientX < x ||
                clientX > x + width ||
                clientY < y ||
                clientY > y + height
              ) {
                return false;
              }
              return true;
            });

          if (!clickedOnAtLeastOneRef && !isMouseDownInside) {
            callback(event);
          }
        }
      },
    [mode, refs, callback, getClickOutsideListenerIsMouseDownInsideState],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, {
      capture: true,
    });
    document.addEventListener('click', handleClickOutside, { capture: true });
    document.addEventListener('touchstart', handleMouseDown, {
      capture: true,
    });
    document.addEventListener('touchend', handleClickOutside, {
      capture: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, {
        capture: true,
      });
      document.removeEventListener('click', handleClickOutside, {
        capture: true,
      });
      document.removeEventListener('touchstart', handleMouseDown, {
        capture: true,
      });
      document.removeEventListener('touchend', handleClickOutside, {
        capture: true,
      });
    };
  }, [refs, callback, mode, handleClickOutside, handleMouseDown]);
};
