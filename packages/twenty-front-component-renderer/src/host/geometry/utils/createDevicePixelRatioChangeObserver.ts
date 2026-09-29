import { isFunction } from '@sniptt/guards';

import { type DevicePixelRatioChangeObserver } from '@/host/geometry/types/DevicePixelRatioChangeObserver';

export const createDevicePixelRatioChangeObserver = (
  onDevicePixelRatioChange: () => void,
): DevicePixelRatioChangeObserver => {
  let resolutionListenerAbortController: AbortController | null = null;

  const disconnect = (): void => {
    resolutionListenerAbortController?.abort();
    resolutionListenerAbortController = null;
  };

  const observe = (): void => {
    disconnect();

    if (!isFunction(window.matchMedia)) {
      return;
    }

    const abortController = new AbortController();

    resolutionListenerAbortController = abortController;

    window
      .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener(
        'change',
        () => {
          observe();
          onDevicePixelRatioChange();
        },
        { signal: abortController.signal },
      );
  };

  return { observe, disconnect };
};
