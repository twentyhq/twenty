import { describe, expect, it } from 'vitest';

import { buildReconcilePlan } from './reconcile-children';

type Item = { id?: string; value: string };

describe('buildReconcilePlan', () => {
  it('keeps+edits one, creates one (no id), and drops the omitted one', () => {
    const existingIds = ['a', 'b'];
    const incoming: Item[] = [
      { id: 'a', value: 'edited' },
      { value: 'new' },
    ];

    const plan = buildReconcilePlan(existingIds, incoming);

    expect(plan).toEqual({
      toCreate: [{ value: 'new' }],
      toUpdate: [{ id: 'a', value: 'edited' }],
      toDelete: ['b'],
    });
  });

  it('returns null when an incoming id is not in existingIds (foreign/stale id)', () => {
    const existingIds = ['a'];
    const incoming: Item[] = [{ id: 'foreign', value: 'x' }];

    expect(buildReconcilePlan(existingIds, incoming)).toBeNull();
  });

  it('returns null when the same id is submitted twice (no double update)', () => {
    const existingIds = ['a', 'b'];
    const incoming: Item[] = [
      { id: 'a', value: 'first' },
      { id: 'a', value: 'second' },
    ];

    expect(buildReconcilePlan(existingIds, incoming)).toBeNull();
  });

  it('deletes everything when incoming is empty', () => {
    const existingIds = ['a', 'b', 'c'];

    const plan = buildReconcilePlan(existingIds, []);

    expect(plan).toEqual({ toCreate: [], toUpdate: [], toDelete: ['a', 'b', 'c'] });
  });
});
