import { isFunction } from '@sniptt/guards';
import { type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

const ENABLED_RANGE_INPUT_SELECTOR = 'input[type="range"]:not(:disabled)';

const nativeEventsWithStartedPointerCapture = new WeakSet<Event>();

const isDragSurface = (element: HTMLElement): boolean =>
  element.ownerDocument.defaultView
    ?.getComputedStyle(element)
    .getPropertyValue('touch-action') === 'none';

export const createSliderPointerCaptureProps = ({
  reactBindableProps,
  pointerCaptureController,
}: {
  reactBindableProps: Record<string, unknown>;
  pointerCaptureController: HostPointerCaptureController | null;
}): Record<string, unknown> | undefined => {
  const remotePointerDown = reactBindableProps.onPointerDown;

  if (
    !isFunction(remotePointerDown) ||
    !isDefined(pointerCaptureController) ||
    reactBindableProps.role === 'separator'
  ) {
    return undefined;
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const isPrimaryPress =
        event.nativeEvent.isTrusted &&
        event.button === 0 &&
        !event.defaultPrevented;
      const isSliderControl =
        isDragSurface(event.currentTarget) &&
        isDefined(
          event.currentTarget.querySelector(ENABLED_RANGE_INPUT_SELECTOR),
        );

      if (
        isPrimaryPress &&
        isSliderControl &&
        !nativeEventsWithStartedPointerCapture.has(event.nativeEvent)
      ) {
        nativeEventsWithStartedPointerCapture.add(event.nativeEvent);
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerCaptureController.startPointerCapture({
          element: event.currentTarget,
          pointerId: event.pointerId,
        });
      }

      remotePointerDown(event);
    },
  };
};
