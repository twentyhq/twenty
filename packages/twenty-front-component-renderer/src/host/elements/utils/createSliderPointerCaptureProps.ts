import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SliderPointerCaptureProps } from '@/host/elements/types/SliderPointerCaptureProps';
import { type SliderPointerDownEvent } from '@/host/elements/types/SliderPointerDownEvent';
import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';
import { readComputedStyleProperties } from '@/host/geometry/utils/readComputedStyleProperties';

const ENABLED_RANGE_INPUT_SELECTOR = 'input[type="range"]:not(:disabled)';

const nativeEventsWithStartedPointerCapture = new WeakSet<object>();

const isSliderControl = (element: HTMLElement): boolean =>
  readComputedStyleProperties({
    node: element,
    propertyNames: ['touch-action'],
  })['touch-action'] === 'none' &&
  isDefined(element.querySelector(ENABLED_RANGE_INPUT_SELECTOR));

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
      const shouldStartPointerCapture =
        event.nativeEvent.isTrusted &&
        event.button === 0 &&
        !event.defaultPrevented &&
        !nativeEventsWithStartedPointerCapture.has(event.nativeEvent) &&
        isSliderControl(event.currentTarget);

      if (shouldStartPointerCapture) {
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
