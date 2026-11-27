import { isObjectViewsLoadNeeded } from '@/metadata-store/utils/isObjectViewsLoadNeeded';

describe('isObjectViewsLoadNeeded', () => {
  it('loads an object whose views were never loaded', () => {
    expect(
      isObjectViewsLoadNeeded({
        objectMetadataId: 'company',
        loadedViewHashByObjectMetadataId: undefined,
        objectViewsHashes: { company: 'hash-1' },
      }),
    ).toBe(true);
  });

  it('keeps loaded views while the server hashes are unknown', () => {
    expect(
      isObjectViewsLoadNeeded({
        objectMetadataId: 'company',
        loadedViewHashByObjectMetadataId: { company: 'hash-1' },
        objectViewsHashes: undefined,
      }),
    ).toBe(false);
  });

  it('keeps loaded views that match the server hash', () => {
    expect(
      isObjectViewsLoadNeeded({
        objectMetadataId: 'company',
        loadedViewHashByObjectMetadataId: { company: 'hash-1' },
        objectViewsHashes: { company: 'hash-1' },
      }),
    ).toBe(false);
  });

  it('reloads views when the server hash changed', () => {
    expect(
      isObjectViewsLoadNeeded({
        objectMetadataId: 'company',
        loadedViewHashByObjectMetadataId: { company: 'hash-1' },
        objectViewsHashes: { company: 'hash-2' },
      }),
    ).toBe(true);
  });

  it('reloads views when the object no longer has visible views', () => {
    expect(
      isObjectViewsLoadNeeded({
        objectMetadataId: 'company',
        loadedViewHashByObjectMetadataId: { company: 'hash-1' },
        objectViewsHashes: {},
      }),
    ).toBe(true);
  });
});
