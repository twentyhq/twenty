export type ParentChainQueue<T> = {
  // Every item currently eligible to process (parent already resolved, or has none) - callers
  // must call enqueueChildrenOf for each item they actually resolve before pulling again.
  drainWave: () => T[];
  enqueueChildrenOf: (item: T) => void;
  hasPending: () => boolean;
};

// Shared by every "process items in parent-before-child order" loop in this app (view filter
// groups, navigation menu item folders, row-level permission predicate groups) - each item has
// at most one parent, so this is a forest, not a general DAG. Grouping children by parent id up
// front makes each wave O(wave size) instead of re-filtering and indexOf/splice-ing the whole
// remaining list per item, which was O(n^2) for n items at one nesting level.
export const createParentChainQueue = <T>(
  items: T[],
  getId: (item: T) => string,
  getParentId: (item: T) => string | null,
  preResolvedIds: ReadonlySet<string>,
): ParentChainQueue<T> => {
  const childrenByParentId = new Map<string, T[]>();
  const queue: T[] = [];

  for (const item of items) {
    const parentId = getParentId(item);
    if (parentId === null || preResolvedIds.has(parentId)) {
      queue.push(item);
      continue;
    }
    const siblings = childrenByParentId.get(parentId);
    if (siblings === undefined) {
      childrenByParentId.set(parentId, [item]);
    } else {
      siblings.push(item);
    }
  }

  return {
    drainWave: () => queue.splice(0, queue.length),
    enqueueChildrenOf: (item: T) => {
      const children = childrenByParentId.get(getId(item));
      if (children !== undefined) {
        queue.push(...children);
      }
    },
    hasPending: () => queue.length > 0,
  };
};
