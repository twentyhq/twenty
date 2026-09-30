import { isFunction } from '@sniptt/guards';

import { type MediaEnvironmentChangeObserver } from '@/host/geometry/types/MediaEnvironmentChangeObserver';

export const createDevicePixelRatioChangeObserver = (
  onDevicePixelRatioChange: () => void,
): MediaEnvironmentChangeObserver => {
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
