import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

describe('useUpdateMetadataStoreDraft', () => {
  it('should adopt new draftCollectionHash when replaceDraft is called with identical data for an up-to-date entry', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const initialData = [
      {
        id: 'obj-1',
        nameSingular: 'company',
        namePlural: 'companies',
      },
    ] as unknown as FlatObjectMetadataItem[];

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: initialData,
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: 'old-server-hash',
      draftCollectionHash: 'new-minted-server-hash',
    });

    const { result } = renderHook(() => useUpdateMetadataStoreDraft(), {
      wrapper,
    });

    act(() => {
      result.current.replaceDraft('objectMetadataItems', initialData);
    });

    const entry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    expect(entry.currentCollectionHash).toBe('new-minted-server-hash');
    expect(entry.draftCollectionHash).toBeUndefined();
    expect(entry.status).toBe('up-to-date');
  });

  it('should adopt collectionHash argument when replaceDraft is called with identical data', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const initialData = [
      {
        id: 'obj-1',
        nameSingular: 'company',
        namePlural: 'companies',
      },
    ] as unknown as FlatObjectMetadataItem[];

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: initialData,
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: 'old-server-hash',
    });

    const { result } = renderHook(() => useUpdateMetadataStoreDraft(), {
      wrapper,
    });

    act(() => {
      result.current.replaceDraft(
        'objectMetadataItems',
        initialData,
        'explicit-hash',
      );
    });

    const entry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    expect(entry.currentCollectionHash).toBe('explicit-hash');
    expect(entry.draftCollectionHash).toBeUndefined();
    expect(entry.status).toBe('up-to-date');
  });

  it('should update draft and transition to draft-pending when data has changed', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const initialData = [
      {
        id: 'obj-1',
        nameSingular: 'company',
        namePlural: 'companies',
      },
    ] as unknown as FlatObjectMetadataItem[];

    const updatedData = [
      {
        id: 'obj-1',
        nameSingular: 'company',
        namePlural: 'enterprises',
      },
    ] as unknown as FlatObjectMetadataItem[];

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: initialData,
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: 'old-server-hash',
    });

    const { result } = renderHook(() => useUpdateMetadataStoreDraft(), {
      wrapper,
    });

    act(() => {
      result.current.replaceDraft(
        'objectMetadataItems',
        updatedData,
        'new-hash',
      );
    });

    const entry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    expect(entry.status).toBe('draft-pending');
    expect(entry.draft).toEqual(updatedData);
    expect(entry.draftCollectionHash).toBe('new-hash');
    expect(entry.currentCollectionHash).toBe('old-server-hash');
  });
});
