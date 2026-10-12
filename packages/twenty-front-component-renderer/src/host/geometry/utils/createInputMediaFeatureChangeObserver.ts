import { isFunction } from '@sniptt/guards';

import { INPUT_MEDIA_FEATURE_QUERIES } from '@/host/geometry/constants/InputMediaFeatureQueries';
import { type MediaEnvironmentChangeObserver } from '@/host/geometry/types/MediaEnvironmentChangeObserver';

export const createInputMediaFeatureChangeObserver = (
  onInputMediaFeatureChange: () => void,
): MediaEnvironmentChangeObserver => {
  let changeListenerAbortController: AbortController | null = null;

  const disconnect = (): void => {
    changeListenerAbortController?.abort();
    changeListenerAbortController = null;
  };

  const observe = (): void => {
    disconnect();

    if (!isFunction(window.matchMedia)) {
      return;
    }

    const abortController = new AbortController();

    changeListenerAbortController = abortController;

    for (const inputMediaFeatureQuery of Object.values(
      INPUT_MEDIA_FEATURE_QUERIES,
    )) {
      window
        .matchMedia(inputMediaFeatureQuery)
        .addEventListener('change', onInputMediaFeatureChange, {
          signal: abortController.signal,
        });
    }
  };

  return { observe, disconnect };
};
