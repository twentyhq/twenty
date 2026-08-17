import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { type WorkerMediaQueryListEvent } from '@/polyfills/media-query/types/WorkerMediaQueryListEvent';
import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';

const CHANGE_EVENT_TYPE = 'change';

type CreateWorkerMediaQueryListInput = {
  media: string;
  evaluateMatches: () => boolean;
  subscribeToEnvironmentUpdates: (listener: () => void) => () => void;
};

export const createWorkerMediaQueryList = ({
  media,
  evaluateMatches,
  subscribeToEnvironmentUpdates,
}: CreateWorkerMediaQueryListInput): WorkerMediaQueryList => {
  const changeListeners = new Set<WorkerMediaQueryListener>();

  let onchangeListener: WorkerMediaQueryListener | null = null;
  let lastNotifiedMatches = false;
  let unsubscribeFromEnvironmentUpdates: (() => void) | null = null;

  const handleEnvironmentUpdate = () => {
    const nextMatches = evaluateMatches();

    if (nextMatches === lastNotifiedMatches) {
      return;
    }

    lastNotifiedMatches = nextMatches;

    const changeEvent: WorkerMediaQueryListEvent = {
      type: CHANGE_EVENT_TYPE,
      media,
      matches: nextMatches,
    };

    const listenersToNotify = [...changeListeners];

    if (isDefined(onchangeListener)) {
      listenersToNotify.push(onchangeListener);
    }

    for (const listenerToNotify of listenersToNotify) {
      const isStillRegistered =
        changeListeners.has(listenerToNotify) ||
        listenerToNotify === onchangeListener;

      if (!isStillRegistered) {
        continue;
      }

      try {
        listenerToNotify(changeEvent);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const ensureEnvironmentSubscription = () => {
    if (isDefined(unsubscribeFromEnvironmentUpdates)) {
      return;
    }

    lastNotifiedMatches = evaluateMatches();
    unsubscribeFromEnvironmentUpdates = subscribeToEnvironmentUpdates(
      handleEnvironmentUpdate,
    );
  };

  const releaseEnvironmentSubscriptionIfUnused = () => {
    if (changeListeners.size > 0 || isDefined(onchangeListener)) {
      return;
    }

    if (!isDefined(unsubscribeFromEnvironmentUpdates)) {
      return;
    }

    unsubscribeFromEnvironmentUpdates();
    unsubscribeFromEnvironmentUpdates = null;
  };

  const addChangeListener = (listener: WorkerMediaQueryListener) => {
    if (!isFunction(listener)) {
      return;
    }

    ensureEnvironmentSubscription();
    changeListeners.add(listener);
  };

  const removeChangeListener = (listener: WorkerMediaQueryListener) => {
    changeListeners.delete(listener);
    releaseEnvironmentSubscriptionIfUnused();
  };

  return {
    media,
    get matches() {
      return evaluateMatches();
    },
    get onchange() {
      return onchangeListener;
    },
    set onchange(listener: WorkerMediaQueryListener | null) {
      onchangeListener = isFunction(listener) ? listener : null;

      if (isDefined(onchangeListener)) {
        ensureEnvironmentSubscription();
        return;
      }

      releaseEnvironmentSubscriptionIfUnused();
    },
    addEventListener: (type: string, listener: WorkerMediaQueryListener) => {
      if (type !== CHANGE_EVENT_TYPE) {
        return;
      }

      addChangeListener(listener);
    },
    removeEventListener: (type: string, listener: WorkerMediaQueryListener) => {
      if (type !== CHANGE_EVENT_TYPE) {
        return;
      }

      removeChangeListener(listener);
    },
    addListener: addChangeListener,
    removeListener: removeChangeListener,
  };
};
