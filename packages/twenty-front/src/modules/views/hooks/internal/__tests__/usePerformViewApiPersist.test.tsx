import { act, renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';
import { DestroyViewDocument } from '~/generated-metadata/graphql';

const viewToDestroy = mockedViews[0];

const initializeMetadataStore = (store: Store) => {
  setTestViewsInMetadataStore(store, [viewToDestroy]);
  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: [{ id: viewToDestroy.objectMetadataId }],
    draft: [],
    status: 'up-to-date',
  });
};

const getViewIdsFromMetadataStore = (store: Store) =>
  store
    .get(metadataStoreState.atomFamily('views'))
    .current.map((view) => (view as { id: string }).id);

describe('usePerformViewApiPersist', () => {
  it('optimistically removes a view while its destroy request is pending', async () => {
    let store: Store | undefined;
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: {
            query: DestroyViewDocument,
            variables: { id: viewToDestroy.id },
          },
          delay: 100,
          result: {
            data: { destroyView: true },
          },
        },
      ],
      onInitializeJotaiStore: (initializedStore) => {
        store = initializedStore;
        initializeMetadataStore(initializedStore);
      },
    });

    const { result } = renderHook(() => usePerformViewApiPersist(), {
      wrapper: Wrapper,
    });

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;

    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    expect(store).toBeDefined();
    if (!store) {
      throw new Error('Jotai store was not initialized');
    }
    expect(getViewIdsFromMetadataStore(store)).not.toContain(viewToDestroy.id);

    await act(async () => {
      await destroyPromise;
    });

    expect(getViewIdsFromMetadataStore(store)).not.toContain(viewToDestroy.id);
  });

  it('restores the view when its destroy request fails', async () => {
    let store: Store | undefined;
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: {
            query: DestroyViewDocument,
            variables: { id: viewToDestroy.id },
          },
          error: new Error('Failed to destroy view'),
        },
      ],
      onInitializeJotaiStore: (initializedStore) => {
        store = initializedStore;
        initializeMetadataStore(initializedStore);
      },
    });

    const { result } = renderHook(() => usePerformViewApiPersist(), {
      wrapper: Wrapper,
    });

    expect(store).toBeDefined();
    if (!store) {
      throw new Error('Jotai store was not initialized');
    }
    const initializedStore = store;
    const previousViewsEntry = initializedStore.get(
      metadataStoreState.atomFamily('views'),
    );
    const pendingFieldMetadataEntry = {
      current: [],
      draft: [{ id: 'pending-field-metadata-id' }],
      status: 'draft-pending' as const,
    };

    act(() => {
      initializedStore.set(
        metadataStoreState.atomFamily('fieldMetadataItems'),
        pendingFieldMetadataEntry,
      );
    });

    await act(async () => {
      await result.current.performViewApiDestroy({ id: viewToDestroy.id });
    });

    expect(
      initializedStore.get(metadataStoreState.atomFamily('views')),
    ).toEqual(previousViewsEntry);
    expect(
      initializedStore.get(metadataStoreState.atomFamily('fieldMetadataItems')),
    ).toEqual(pendingFieldMetadataEntry);
  });

  it('preserves concurrent view changes when its destroy request fails', async () => {
    let store: Store | undefined;
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: {
            query: DestroyViewDocument,
            variables: { id: viewToDestroy.id },
          },
          delay: 100,
          error: new Error('Failed to destroy view'),
        },
      ],
      onInitializeJotaiStore: (initializedStore) => {
        store = initializedStore;
        initializeMetadataStore(initializedStore);
      },
    });

    const { result } = renderHook(() => usePerformViewApiPersist(), {
      wrapper: Wrapper,
    });

    expect(store).toBeDefined();
    if (!store) {
      throw new Error('Jotai store was not initialized');
    }

    const initializedStore = store;
    const viewsStoreAtom = metadataStoreState.atomFamily('views');
    const concurrentView = {
      ...initializedStore.get(viewsStoreAtom).current[0],
      id: 'concurrent-view-id',
    };

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;

    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    act(() => {
      initializedStore.set(viewsStoreAtom, {
        current: [concurrentView],
        draft: [],
        status: 'up-to-date',
      });
    });

    await act(async () => {
      await destroyPromise;
    });

    expect(initializedStore.get(viewsStoreAtom).current).toEqual([
      concurrentView,
      expect.objectContaining({ id: viewToDestroy.id }),
    ]);
  });
});
