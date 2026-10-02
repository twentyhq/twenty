import { isFunction } from '@sniptt/guards';
import { type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { cancelSeparatorDragOnEscape } from '@/host/elements/utils/cancelSeparatorDragOnEscape';

export const createResizableSeparatorProps = (
  reactBindableProps: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const remoteMouseDown = reactBindableProps.onMouseDown;
  const remotePointerDown = reactBindableProps.onPointerDown;
  const remotePointerUp = reactBindableProps.onPointerUp;
  const remotePointerCancel = reactBindableProps.onPointerCancel;
  const remoteKeyDown = reactBindableProps.onKeyDown;
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

  const releasePointerCapture = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    onMouseDown: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      if (isFunction(remoteMouseDown)) {
        remoteMouseDown(event);
      }
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || event.defaultPrevented) {
        return;
      }

      const { pointerId } = event;

      event.currentTarget.setPointerCapture(pointerId);
      cancelSeparatorDragOnEscape({
        separator: event.currentTarget,
        pointerId,
        onCancel: () => {
          if (isFunction(remotePointerCancel)) {
            remotePointerCancel({ type: 'pointercancel', pointerId });
          }
        },
      });
      remotePointerDown(event);
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      releasePointerCapture(event);
      if (isFunction(remotePointerUp)) {
        remotePointerUp(event);
      }
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      releasePointerCapture(event);
      if (isFunction(remotePointerCancel)) {
        remotePointerCancel(event);
      }
    },
    onLostPointerCapture: (event: PointerEvent<HTMLElement>) => {
      if (isFunction(remotePointerCancel)) {
        remotePointerCancel(event);
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const hasModifierKey = event.altKey || event.ctrlKey || event.metaKey;
      const isSeparatorKey = [
        ' ',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(event.key);

      if (isSeparatorKey && !hasModifierKey) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (isFunction(remoteKeyDown)) {
        remoteKeyDown(event);
      }
    },
  };
};
