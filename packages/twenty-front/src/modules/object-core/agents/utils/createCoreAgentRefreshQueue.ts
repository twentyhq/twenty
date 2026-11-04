import { isDefined } from 'twenty-shared/utils';

export const createCoreAgentRefreshQueue = (refresh: () => Promise<void>) => {
  let runningRefresh: Promise<void> | undefined;
  let queuedRefresh: Promise<void> | undefined;

  const startRefresh = () => {
    const startedRefresh = Promise.resolve()
      .then(refresh)
      .finally(() => {
        if (runningRefresh === startedRefresh) {
          runningRefresh = undefined;
        }
      });

    runningRefresh = startedRefresh;

    return startedRefresh;
  };

  return () => {
    if (isDefined(queuedRefresh)) {
      return queuedRefresh;
    }

    if (!isDefined(runningRefresh)) {
      return startRefresh();
    }

    queuedRefresh = runningRefresh
      .catch(() => undefined)
      .then(() => {
        queuedRefresh = undefined;

        return startRefresh();
      });

    return queuedRefresh;
  };
};
