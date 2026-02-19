import { useCallback, useEffect, type RefObject } from 'react';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerIsMouseDownInsideComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';

const CLICK_OUTSIDE_DEBUG_MODE = false;

export type ClickOutsideListenerProps<T extends Element> = {
  refs: Array<RefObject<T>>;
  excludedClickOutsideIds?: string[];
  callback: (event: MouseEvent | TouchEvent) => void;
  listenerId: string;
  enabled?: boolean;
};

export const useListenClickOutside = <T extends Element>({
  refs,
  excludedClickOutsideIds,
  callback,
  listenerId,
  enabled = true,
}: ClickOutsideListenerProps<T>) => {
  const handleMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const clickOutsideListenerIsActivated = jotaiStore.get(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId: listenerId,
        }),
      );

      jotaiStore.set(
        clickOutsideListenerMouseDownHappenedComponentState.atomFamily({
          instanceId: listenerId,
        }),
        true,
      );

      const isListening = clickOutsideListenerIsActivated && enabled;

      if (!isListening) {
        return;
      }

      const clickedOnAtLeastOneRef = refs
        .filter((ref) => !!ref.current)
        .some((ref) => ref.current?.contains(event.target as Node));

      jotaiStore.set(
        clickOutsideListenerIsMouseDownInsideComponentState.atomFamily({
          instanceId: listenerId,
        }),
        clickedOnAtLeastOneRef,
      );
    },
    [listenerId, enabled, refs],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const clickOutsideListenerIsActivated = jotaiStore.get(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId: listenerId,
        }),
      );

      const isListening = clickOutsideListenerIsActivated && enabled;

      const isMouseDownInside = jotaiStore.get(
        clickOutsideListenerIsMouseDownInsideComponentState.atomFamily({
          instanceId: listenerId,
        }),
      );

      const hasMouseDownHappened = jotaiStore.get(
        clickOutsideListenerMouseDownHappenedComponentState.atomFamily({
          instanceId: listenerId,
        }),
      );

      const clickedElement = event.target as HTMLElement;
      let isClickedOnExcluded = false;
      let currentElement: HTMLElement | null = clickedElement;

      while (currentElement) {
        const currentDataAttributes = currentElement.dataset;
        const isGloballyExcluded =
          currentDataAttributes?.globallyPreventClickOutside === 'true';

        const clickOutsideId = currentDataAttributes?.clickOutsideId;

        isClickedOnExcluded =
          isGloballyExcluded ||
          (isDefined(clickOutsideId) &&
            isDefined(excludedClickOutsideIds) &&
            excludedClickOutsideIds.includes(clickOutsideId));

        if (isClickedOnExcluded) {
          break;
        }

        currentElement = currentElement.parentElement;
      }

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
    },
    [listenerId, enabled, refs, excludedClickOutsideIds, callback],
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
  }, [refs, callback, handleClickOutside, handleMouseDown]);
};
