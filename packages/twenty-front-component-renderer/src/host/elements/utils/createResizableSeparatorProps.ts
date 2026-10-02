import { isFunction } from '@sniptt/guards';
import { type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

const pointerIdsReleasedAtGestureEndBySeparator = new WeakMap<
  Element,
  Set<number>
>();

const markPointerReleasedAtGestureEnd = (
  separator: Element,
  pointerId: number,
) => {
  const releasedPointerIds =
    pointerIdsReleasedAtGestureEndBySeparator.get(separator) ??
    new Set<number>();

  releasedPointerIds.add(pointerId);
  pointerIdsReleasedAtGestureEndBySeparator.set(separator, releasedPointerIds);
};

const takePointerReleasedAtGestureEnd = (
  separator: Element,
  pointerId: number,
): boolean =>
  pointerIdsReleasedAtGestureEndBySeparator.get(separator)?.delete(pointerId) ??
  false;

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

  const releasePointerCaptureAtGestureEnd = (
    event: PointerEvent<HTMLElement>,
  ) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    markPointerReleasedAtGestureEnd(event.currentTarget, event.pointerId);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || event.defaultPrevented) {
        return;
      }

      takePointerReleasedAtGestureEnd(event.currentTarget, event.pointerId);
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
      if (
        takePointerReleasedAtGestureEnd(event.currentTarget, event.pointerId)
      ) {
        return;
      }

      if (isFunction(remotePointerCancel)) {
        remotePointerCancel(event);
      }
    },
  };
};
