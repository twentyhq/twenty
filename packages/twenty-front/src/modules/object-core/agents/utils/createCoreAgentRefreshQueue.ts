import { isDefined } from 'twenty-shared/utils';

export const createCoreAgentRefreshQueue = (refresh: () => Promise<void>) => {
  let pendingRefresh: Promise<void> | undefined;
  let hasPendingRefresh = false;

  return () => {
    hasPendingRefresh = true;

    if (isDefined(pendingRefresh)) {
      return pendingRefresh;
    }

    pendingRefresh = Promise.resolve().then(async () => {
      try {
        while (hasPendingRefresh) {
          hasPendingRefresh = false;

          try {
            await refresh();
          } catch (error) {
            if (!hasPendingRefresh) {
              throw error;
            }
          }
        }
      } finally {
        pendingRefresh = undefined;
      }
    });

    return pendingRefresh;
  };
};
