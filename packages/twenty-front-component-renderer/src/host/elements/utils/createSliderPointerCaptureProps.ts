import { isFunction } from '@sniptt/guards';
import { type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const createSliderPointerCaptureProps = (
  reactBindableProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remotePointerDown = reactBindableProps.onPointerDown;

  if (
    !isFunction(remotePointerDown) ||
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
      const enabledSlider = event.currentTarget.querySelector(
        'input[type="range"]:not(:disabled)',
      );

      if (isPrimaryPress && isDefined(enabledSlider)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      remotePointerDown(event);
    },
  };
};
