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
    const previousViewsEntry = store.get(
      metadataStoreState.atomFamily('views'),
    );

    await act(async () => {
      await result.current.performViewApiDestroy({ id: viewToDestroy.id });
    });

    expect(store.get(metadataStoreState.atomFamily('views'))).toEqual(
      previousViewsEntry,
    );
  });
});
