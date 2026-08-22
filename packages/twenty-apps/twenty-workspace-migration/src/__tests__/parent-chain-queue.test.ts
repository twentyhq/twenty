import { describe, expect, it } from 'vitest';
import { createParentChainQueue } from 'src/logic-functions/utils/parent-chain-queue.util';

type Node = { id: string; parentId: string | null };

const drainAll = (items: Node[], preResolvedIds: Set<string> = new Set()): Node[] => {
  const queue = createParentChainQueue(items, (item) => item.id, (item) => item.parentId, preResolvedIds);
  const processed: Node[] = [];

  while (queue.hasPending()) {
    for (const item of queue.drainWave()) {
      processed.push(item);
      queue.enqueueChildrenOf(item);
    }
  }

  return processed;
};

describe('createParentChainQueue', () => {
  it('yields every root when nothing has a parent', () => {
    const items: Node[] = [{ id: 'a', parentId: null }, { id: 'b', parentId: null }];
    expect(drainAll(items).map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('yields a parent before its child even when the child comes first in the input', () => {
    const items: Node[] = [
      { id: 'grandchild', parentId: 'child' },
      { id: 'child', parentId: 'root' },
      { id: 'root', parentId: null },
    ];
    expect(drainAll(items).map((item) => item.id)).toEqual(['root', 'child', 'grandchild']);
  });

  it('treats a parent already present in the target as resolved, so its children are roots', () => {
    const items: Node[] = [{ id: 'child', parentId: 'already-in-target' }];
    expect(drainAll(items, new Set(['already-in-target'])).map((item) => item.id)).toEqual(['child']);
  });

  it('never yields an item whose parent is missing entirely', () => {
    const items: Node[] = [
      { id: 'root', parentId: null },
      { id: 'orphan', parentId: 'never-existed' },
    ];
    expect(drainAll(items).map((item) => item.id)).toEqual(['root']);
  });

  it('leaves descendants of a skipped item unprocessed', () => {
    // The caller signals "skipped" by not calling enqueueChildrenOf - a child must not be
    // created pointing at a parent that was rejected and therefore never created.
    const items: Node[] = [
      { id: 'root', parentId: null },
      { id: 'skipped', parentId: null },
      { id: 'under-skipped', parentId: 'skipped' },
    ];
    const queue = createParentChainQueue(items, (item) => item.id, (item) => item.parentId, new Set());
    const processed: string[] = [];

    while (queue.hasPending()) {
      for (const item of queue.drainWave()) {
        processed.push(item.id);
        if (item.id !== 'skipped') {
          queue.enqueueChildrenOf(item);
        }
      }
    }

    expect(processed).toEqual(['root', 'skipped']);
  });

  it('does not re-yield items once drained', () => {
    const queue = createParentChainQueue(
      [{ id: 'a', parentId: null }],
      (item) => item.id,
      (item) => item.parentId,
      new Set(),
    );

    expect(queue.drainWave()).toHaveLength(1);
    expect(queue.hasPending()).toBe(false);
    expect(queue.drainWave()).toHaveLength(0);
  });
});
