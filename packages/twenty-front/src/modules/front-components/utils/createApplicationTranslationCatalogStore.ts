type CatalogSnapshot = {
  translationCatalog: Record<string, string>;
  isWaitingForInitialCatalog: boolean;
};

export type ApplicationTranslationCatalogStore = {
  getSnapshot: () => CatalogSnapshot;
  subscribe: (listener: () => void) => () => void;
  invalidate: () => void;
};

const INITIAL_WAIT_MS = 500;
const UNUSED_CATALOG_TTL_MS = 5 * 60 * 1000;

export const createApplicationTranslationCatalogStore = ({
  load,
  onUnused,
}: {
  load: () => Promise<Record<string, string>>;
  onUnused: () => void;
}): ApplicationTranslationCatalogStore => {
  let snapshot: CatalogSnapshot = {
    translationCatalog: {},
    isWaitingForInitialCatalog: true,
  };
  const listeners = new Set<() => void>();
  let isFetching = false;
  let isScheduled = false;
  let isDirty = false;
  let initialWaitTimeout: ReturnType<typeof setTimeout> | undefined;
  let evictionTimeout = setTimeout(onUnused, UNUSED_CATALOG_TTL_MS);

  const publish = (nextSnapshot: CatalogSnapshot) => {
    snapshot = nextSnapshot;
    for (const listener of listeners) {
      listener();
    }
  };

  const refresh = async () => {
    isScheduled = false;
    if (isFetching || listeners.size === 0 || !isDirty) {
      return;
    }
    isFetching = true;
    isDirty = false;
    try {
      const translationCatalog = await load().catch(
        () => snapshot.translationCatalog,
      );
      clearTimeout(initialWaitTimeout);
      publish({ translationCatalog, isWaitingForInitialCatalog: false });
    } finally {
      isFetching = false;
      if (isDirty) {
        schedule();
      }
    }
  };

  const schedule = () => {
    if (isScheduled) {
      return;
    }
    isScheduled = true;
    queueMicrotask(() => {
      void refresh();
    });
  };
  const invalidate = () => {
    isDirty = true;
    schedule();
  };

  return {
    getSnapshot: () => snapshot,
    invalidate,
    subscribe: (listener) => {
      clearTimeout(evictionTimeout);
      listeners.add(listener);
      if (listeners.size === 1) {
        if (snapshot.isWaitingForInitialCatalog) {
          initialWaitTimeout = setTimeout(() => {
            publish({ ...snapshot, isWaitingForInitialCatalog: false });
          }, INITIAL_WAIT_MS);
        }
        invalidate();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          clearTimeout(initialWaitTimeout);
          evictionTimeout = setTimeout(onUnused, UNUSED_CATALOG_TTL_MS);
        }
      };
    },
  };
};
