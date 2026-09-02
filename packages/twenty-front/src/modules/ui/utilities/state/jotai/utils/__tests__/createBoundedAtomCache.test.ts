import { atom } from 'jotai';

import { createBoundedAtomCache } from '@/ui/utilities/state/jotai/utils/createBoundedAtomCache';

describe('createBoundedAtomCache', () => {
  it('returns the cached atom for a known key', () => {
    const cache = createBoundedAtomCache<ReturnType<typeof atom<number>>>();
    const cachedAtom = atom(1);

    cache.set('a', cachedAtom);

    expect(cache.get('a')).toBe(cachedAtom);
  });

  it('returns undefined for an unknown key', () => {
    const cache = createBoundedAtomCache<ReturnType<typeof atom<number>>>();

    expect(cache.get('missing')).toBeUndefined();
  });

  it('stops growing once far more keys than the bound are inserted', () => {
    const maxCachedAtomsPerGeneration = 10;
    const cache = createBoundedAtomCache<ReturnType<typeof atom<number>>>(
      maxCachedAtomsPerGeneration,
    );

    for (let index = 0; index < 1000; index++) {
      cache.set(`key-${index}`, atom(index));
    }

    expect(cache.size()).toBeLessThanOrEqual(
      2 * (maxCachedAtomsPerGeneration + 1),
    );
  });

  it('drops the coldest keys and keeps the most recently written ones', () => {
    const cache = createBoundedAtomCache<ReturnType<typeof atom<number>>>(10);

    for (let index = 0; index < 100; index++) {
      cache.set(`key-${index}`, atom(index));
    }

    expect(cache.get('key-0')).toBeUndefined();
    expect(cache.get('key-99')).toBeDefined();
  });

  it('keeps an atom that is read again before its generation rotates out', () => {
    const cache = createBoundedAtomCache<ReturnType<typeof atom<number>>>(10);
    const survivingAtom = atom(0);

    cache.set('survivor', survivingAtom);

    for (let index = 0; index < 100; index++) {
      cache.set(`key-${index}`, atom(index));
      cache.get('survivor');
    }

    expect(cache.get('survivor')).toBe(survivingAtom);
  });
});
