import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerIsMouseDownInsideComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import React, { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

const CLICK_OUTSIDE_DEBUG_MODE = false;

export enum ClickOutsideMode {
  comparePixels = 'comparePixels',
  compareHTMLRef = 'compareHTMLRef',
}

export type ClickOutsideListenerProps<T extends Element> = {
  refs: Array<React.RefObject<T>>;
  excludeClassNames?: string[];
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
  listenerId: string;
  enabled?: boolean;
};

export const useListenClickOutside = <T extends Element>({
  refs,
  excludeClassNames,
  callback,
  mode = ClickOutsideMode.compareHTMLRef,
  listenerId,
  enabled = true,
}: ClickOutsideListenerProps<T>) => {
  const clickOutsideListenerIsMouseDownInsideState =
    useRecoilComponentCallbackStateV2(
      clickOutsideListenerIsMouseDownInsideComponentState,
      listenerId,
    );
  const clickOutsideListenerIsActivatedState =
    useRecoilComponentCallbackStateV2(
      clickOutsideListenerIsActivatedComponentState,
      listenerId,
    );
  const clickOutsideListenerMouseDownHappenedState =
    useRecoilComponentCallbackStateV2(
      clickOutsideListenerMouseDownHappenedComponentState,
      listenerId,
    );

  const handleMouseDown = useRecoilCallback(
    ({ snapshot, set }) =>
      (event: MouseEvent | TouchEvent) => {
        const clickOutsideListenerIsActivated = snapshot
          .getLoadable(clickOutsideListenerIsActivatedState)
          .getValue();

        set(clickOutsideListenerMouseDownHappenedState, true);

        const isListening = clickOutsideListenerIsActivated && enabled;

        if (!isListening) {
          return;
        }

        switch (mode) {
          case ClickOutsideMode.compareHTMLRef: {
            const clickedOnAtLeastOneRef = refs
              .filter((ref) => !!ref.current)
              .some((ref) => ref.current?.contains(event.target as Node));

            set(
              clickOutsideListenerIsMouseDownInsideState,
              clickedOnAtLeastOneRef,
            );
            break;
          }

          case ClickOutsideMode.comparePixels: {
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
              clickOutsideListenerIsMouseDownInsideState,
              clickedOnAtLeastOneRef,
            );
            break;
          }

          default: {
            break;
          }
        }
      },
    [
      clickOutsideListenerIsActivatedState,
      clickOutsideListenerMouseDownHappenedState,
      enabled,
      mode,
      refs,
      clickOutsideListenerIsMouseDownInsideState,
    ],
  );

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const clickOutsideListenerIsActivated = snapshot
          .getLoadable(clickOutsideListenerIsActivatedState)
          .getValue();

        const isListening = clickOutsideListenerIsActivated && enabled;

        const isMouseDownInside = snapshot
          .getLoadable(clickOutsideListenerIsMouseDownInsideState)
          .getValue();

        const hasMouseDownHappened = snapshot
          .getLoadable(clickOutsideListenerMouseDownHappenedState)
          .getValue();

        const clickedElement = event.target as HTMLElement;
        let isClickedOnExcluded = false;
        let currentElement: HTMLElement | null = clickedElement;

        while (currentElement) {
          const currentClassList = currentElement.classList;

          isClickedOnExcluded =
            excludeClassNames?.some((className) =>
              currentClassList.contains(className),
            ) ?? false;

          if (isClickedOnExcluded) {
            break;
          }

          currentElement = currentElement.parentElement;
        }

        if (mode === ClickOutsideMode.compareHTMLRef) {
          const clickedOnAtLeastOneRef = refs
            .filter((ref) => !!ref.current)
            .some((ref) => ref.current?.contains(event.target as Node));

          const shouldTrigger =
            isListening &&
            hasMouseDownHappened &&
            !clickedOnAtLeastOneRef &&
            !isMouseDownInside &&
            !isClickedOnExcluded;

          if (CLICK_OUTSIDE_DEBUG_MODE) {
            // eslint-disable-next-line no-console
            console.log('click outside compare ref', {
              listenerId,
              shouldTrigger,
              clickedOnAtLeastOneRef,
              isMouseDownInside,
              isListening,
              hasMouseDownHappened,
              isClickedOnExcluded,
              enabled,
              event,
            });
          }

          if (shouldTrigger) {
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

          const shouldTrigger =
            !clickedOnAtLeastOneRef &&
            !isMouseDownInside &&
            isListening &&
            hasMouseDownHappened &&
            !isClickedOnExcluded;

          if (CLICK_OUTSIDE_DEBUG_MODE) {
            // eslint-disable-next-line no-console
            console.log('click outside compare pixel', {
              listenerId,
              shouldTrigger,
              clickedOnAtLeastOneRef,
              isMouseDownInside,
              isListening,
              hasMouseDownHappened,
              isClickedOnExcluded,
              enabled,
              event,
            });
          }

          if (shouldTrigger) {
            callback(event);
          }
        }
      },
    [
      clickOutsideListenerIsActivatedState,
      enabled,
      clickOutsideListenerIsMouseDownInsideState,
      clickOutsideListenerMouseDownHappenedState,
      mode,
      refs,
      excludeClassNames,
      callback,
      listenerId,
    ],
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
