import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SliderPointerCaptureProps } from '@/host/elements/types/SliderPointerCaptureProps';
import { type SliderPointerDownEvent } from '@/host/elements/types/SliderPointerDownEvent';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

const ENABLED_RANGE_INPUT_SELECTOR = 'input[type="range"]:not(:disabled)';

const nativeEventsWithStartedPointerCapture = new WeakSet<object>();

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
}): SliderPointerCaptureProps | undefined => {
  const remotePointerDown = reactBindableProps.onPointerDown;

  if (
    !isFunction(remotePointerDown) ||
    !isDefined(pointerCaptureController) ||
    reactBindableProps.role === 'separator'
  ) {
    return undefined;
  }

  return {
    onPointerDown: (event: SliderPointerDownEvent) => {
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
