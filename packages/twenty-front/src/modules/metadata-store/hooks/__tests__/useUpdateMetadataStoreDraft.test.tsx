import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import {
  metadataStoreState,
  type MetadataStoreItem,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const OBJECT_METADATA_ITEMS = [
  { id: 'object-1', nameSingular: 'company', namePlural: 'companies' },
] as unknown as FlatObjectMetadataItem[];

const renderReplaceDraft = ({
  entry,
  data,
  collectionHash,
}: {
  entry: Partial<MetadataStoreItem>;
  data: FlatObjectMetadataItem[];
  collectionHash?: string;
}) => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: OBJECT_METADATA_ITEMS,
    draft: [],
    status: 'up-to-date',
    currentCollectionHash: 'old-hash',
    ...entry,
  });

  const { result } = renderHook(() => useUpdateMetadataStoreDraft(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  act(() => {
    result.current.replaceDraft('objectMetadataItems', data, collectionHash);
  });

  return store.get(metadataStoreState.atomFamily('objectMetadataItems'));
};

describe('useUpdateMetadataStoreDraft', () => {
  it('adopts the pending server hash when refetched data is unchanged', () => {
    const entry = renderReplaceDraft({
      entry: { draftCollectionHash: 'new-hash' },
      data: OBJECT_METADATA_ITEMS,
    });

    expect(entry.status).toBe('up-to-date');
    expect(entry.currentCollectionHash).toBe('new-hash');
    expect(entry.draftCollectionHash).toBeUndefined();
  });

  it('adopts an explicit hash when refetched data is unchanged', () => {
    const entry = renderReplaceDraft({
      entry: {},
      data: OBJECT_METADATA_ITEMS,
      collectionHash: 'explicit-hash',
    });

    expect(entry.status).toBe('up-to-date');
    expect(entry.currentCollectionHash).toBe('explicit-hash');
  });

  it('stages changed data as a pending draft', () => {
    const changedData = [
      { ...OBJECT_METADATA_ITEMS[0], namePlural: 'enterprises' },
    ];

    const entry = renderReplaceDraft({
      entry: {},
      data: changedData,
      collectionHash: 'new-hash',
    });

    expect(entry.status).toBe('draft-pending');
    expect(entry.draft).toEqual(changedData);
    expect(entry.draftCollectionHash).toBe('new-hash');
    expect(entry.currentCollectionHash).toBe('old-hash');
  });
});
