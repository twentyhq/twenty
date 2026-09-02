export type BoundedAtomCache<TAtom> = {
  get: (cacheKey: string) => TAtom | undefined;
  set: (cacheKey: string, atomToCache: TAtom) => void;
  size: () => number;
};

// A record table renders at most a few hundred rows at a time but caches one selector
// atom per cell it has ever rendered, so scrolling grew the cache without bound. Two
// generations of this size can be retained at once.
export const DEFAULT_MAX_CACHED_ATOMS_PER_GENERATION = 20000;

// Selector atoms are pure projections of the atoms they read, so dropping one costs a
// recompute on the next read and never loses state: a component still holding an
// evicted atom keeps reading the same source through it.
export const createBoundedAtomCache = <TAtom>(
  maxCachedAtomsPerGeneration = DEFAULT_MAX_CACHED_ATOMS_PER_GENERATION,
): BoundedAtomCache<TAtom> => {
  let currentGeneration = new Map<string, TAtom>();
  let previousGeneration = new Map<string, TAtom>();

  // Rotating whole generations keeps a cache hit a single Map lookup. An LRU would have
  // to delete and re-insert on every hit, which measured 4x slower on the cell path.
  const setInCurrentGeneration = (cacheKey: string, atomToCache: TAtom) => {
    currentGeneration.set(cacheKey, atomToCache);

    if (currentGeneration.size > maxCachedAtomsPerGeneration) {
      previousGeneration = currentGeneration;
      currentGeneration = new Map();
    }
  };

  return {
    get: (cacheKey) => {
      const atomFromCurrentGeneration = currentGeneration.get(cacheKey);

      if (atomFromCurrentGeneration !== undefined) {
        return atomFromCurrentGeneration;
      }

      const atomFromPreviousGeneration = previousGeneration.get(cacheKey);

      if (atomFromPreviousGeneration !== undefined) {
        setInCurrentGeneration(cacheKey, atomFromPreviousGeneration);
      }

      return atomFromPreviousGeneration;
    },
    set: setInCurrentGeneration,
    size: () => currentGeneration.size + previousGeneration.size,
  };
};
