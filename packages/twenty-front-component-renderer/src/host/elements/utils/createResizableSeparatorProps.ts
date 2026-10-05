import { isFunction } from '@sniptt/guards';
import { type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { createSeparatorPointerCaptureReleaseTracker } from '@/host/elements/utils/createSeparatorPointerCaptureReleaseTracker';

const {
  releasePointerCaptureAtGestureEnd,
  consumePointerCaptureReleasedAtGestureEnd,
} = createSeparatorPointerCaptureReleaseTracker();

export const createResizableSeparatorProps = (
  reactBindableProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remotePointerDown = reactBindableProps.onPointerDown;
  const remotePointerUp = reactBindableProps.onPointerUp;
  const remotePointerCancel = reactBindableProps.onPointerCancel;
  const isDisabled =
    reactBindableProps['aria-disabled'] === true ||
    reactBindableProps['aria-disabled'] === 'true';

  if (
    reactBindableProps.role !== 'separator' ||
    !isDefined(reactBindableProps['aria-valuenow']) ||
    !isFunction(remotePointerDown) ||
    isDisabled
  ) {
    return undefined;
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || event.defaultPrevented) {
        return;
      }

      consumePointerCaptureReleasedAtGestureEnd(event);
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      remotePointerDown(event);
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      releasePointerCaptureAtGestureEnd(event);
      if (isFunction(remotePointerUp)) {
        remotePointerUp(event);
      }
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      releasePointerCaptureAtGestureEnd(event);
      if (isFunction(remotePointerCancel)) {
        remotePointerCancel(event);
      }
    },
    onLostPointerCapture: (event: PointerEvent<HTMLElement>) => {
      if (consumePointerCaptureReleasedAtGestureEnd(event)) {
        return;
      }

      if (isFunction(remotePointerCancel)) {
        remotePointerCancel(event);
      }
    },
  };
};
