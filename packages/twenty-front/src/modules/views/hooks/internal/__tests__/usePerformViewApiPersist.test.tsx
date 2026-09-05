import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import {
  METADATA_STORE_KEY_PREFIX,
  metadataStoreState,
} from '@/metadata-store/states/metadataStoreState';
import { metadataStoreStorage } from '@/metadata-store/storage/metadataStoreStorage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import {
  DestroyViewDocument,
  type DestroyViewMutation,
  type DestroyViewMutationVariables,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const viewToDestroy = { ...mockedViews[0], name: 'View to delete' };
const destroyRequest = {
  query: DestroyViewDocument,
  variables: { id: viewToDestroy.id },
};

const VisibleViews = () => {
  const views = useAtomStateValue(viewsSelector);

  return (
    <ul>
      {views.map((view) => (
        <li key={view.id}>{view.name}</li>
      ))}
    </ul>
  );
};

const renderViewDeletion = (
  apolloMocks: MockedResponse<
    DestroyViewMutation,
    DestroyViewMutationVariables
  >[],
) => {
  let store: Store | undefined;
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;
      setTestViewsInMetadataStore(initializedStore, [viewToDestroy]);
      initializedStore.set(metadataStoreState.atomFamily('views'), (entry) => ({
        ...entry,
        currentCollectionHash: 'original-views-hash',
      }));
      initializedStore.set(
        metadataStoreState.atomFamily('objectMetadataItems'),
        {
          current: [{ id: viewToDestroy.objectMetadataId }],
          draft: [],
          status: 'up-to-date',
        },
      );
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataWrapper>
      <MetadataStoreSSEEffect />
      <VisibleViews />
      {children}
    </MetadataWrapper>
  );

  const hook = renderHook(() => usePerformViewApiPersist(), {
    wrapper: Wrapper,
  });

  if (!isDefined(store)) {
    throw new Error('Jotai store was not initialized');
  }

  return { ...hook, store };
};

describe('usePerformViewApiPersist', () => {
  it('hides a pending deletion without changing the persisted snapshot', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 100,
        result: { data: { destroyView: true } },
      },
    ]);
    const viewsStoreAtom = metadataStoreState.atomFamily('views');
    const previousViewsEntry = store.get(viewsStoreAtom);
    expect(screen.getByText(viewToDestroy.name)).toBeInTheDocument();

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    expect(store.get(viewsStoreAtom)).toEqual(previousViewsEntry);
    expect(
      metadataStoreStorage.getItem(`${METADATA_STORE_KEY_PREFIX}views`, {
        current: [],
        draft: [],
        status: 'empty',
      }),
    ).toEqual(previousViewsEntry);

    await act(async () => {
      await destroyPromise;
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    expect(store.get(viewsStoreAtom).current).toEqual([]);
  });

  it('shows the view after failure without committing unrelated metadata drafts', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        error: new Error('Failed to destroy view'),
      },
    ]);
    const previousViewsEntry = store.get(
      metadataStoreState.atomFamily('views'),
    );
    const pendingFieldMetadataEntry = {
      current: [],
      draft: [{ id: 'pending-field-metadata-id' }],
      status: 'draft-pending' as const,
    };

    act(() => {
      store.set(
        metadataStoreState.atomFamily('fieldMetadataItems'),
        pendingFieldMetadataEntry,
      );
    });

    await act(async () => {
      const response = await result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
      expect(response.status).toBe('failed');
    });

    expect(screen.getByText(viewToDestroy.name)).toBeInTheDocument();
    expect(store.get(metadataStoreState.atomFamily('views'))).toEqual(
      previousViewsEntry,
    );
    expect(
      store.get(metadataStoreState.atomFamily('fieldMetadataItems')),
    ).toEqual(pendingFieldMetadataEntry);
  });

  it('retains the view when a new store hydrates during a pending deletion', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 100,
        error: new Error('Failed to destroy view'),
      },
    ]);

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    const persistedViewsEntry = metadataStoreStorage.getItem(
      `${METADATA_STORE_KEY_PREFIX}views`,
      { current: [], draft: [], status: 'empty' },
    );
    const reloadedStore = createStore();
    reloadedStore.set(
      metadataStoreState.atomFamily('views'),
      persistedViewsEntry,
    );
    reloadedStore.set(
      metadataStoreState.atomFamily('objectMetadataItems'),
      store.get(metadataStoreState.atomFamily('objectMetadataItems')),
    );

    expect(reloadedStore.get(viewsSelector.atom)).toEqual([
      expect.objectContaining({ id: viewToDestroy.id }),
    ]);
    expect(persistedViewsEntry.currentCollectionHash).toBe(
      'original-views-hash',
    );

    await act(async () => {
      await destroyPromise;
    });
  });

  it('preserves server updates to the pending view and other views after failure', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 100,
        error: new Error('Failed to destroy view'),
      },
    ]);
    const viewsStoreAtom = metadataStoreState.atomFamily('views');
    const updatedView = {
      ...store.get(viewsStoreAtom).current[0],
      name: 'Updated on the server',
    };
    const concurrentView = {
      ...updatedView,
      id: 'concurrent-view-id',
      name: 'Concurrent view',
    };

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
      for (const updatedRecord of [updatedView, concurrentView]) {
        window.dispatchEvent(
          new CustomEvent(METADATA_OPERATION_BROWSER_EVENT_NAME, {
            detail: {
              metadataName: 'view',
              operation: { type: 'update', updatedRecord },
              updatedCollectionHash: 'updated-views-hash',
            },
          }),
        );
      }
    });

    expect(screen.queryByText(updatedView.name)).not.toBeInTheDocument();
    expect(screen.getByText(concurrentView.name)).toBeInTheDocument();

    await act(async () => {
      await destroyPromise;
    });

    expect(screen.getByText(updatedView.name)).toBeInTheDocument();
    expect(screen.getByText(concurrentView.name)).toBeInTheDocument();
    expect(store.get(viewsStoreAtom).current).toEqual([
      updatedView,
      concurrentView,
    ]);
    expect(store.get(viewsStoreAtom).currentCollectionHash).toBe(
      'updated-views-hash',
    );
  });

  it('does not restore a server-confirmed deletion when the request fails', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 100,
        error: new Error('View was already deleted'),
      },
    ]);

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
      window.dispatchEvent(
        new CustomEvent(METADATA_OPERATION_BROWSER_EVENT_NAME, {
          detail: {
            metadataName: 'view',
            operation: {
              type: 'delete',
              deletedRecordId: viewToDestroy.id,
            },
            updatedCollectionHash: 'deleted-view-hash',
          },
        }),
      );
    });

    await act(async () => {
      await destroyPromise;
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    expect(store.get(metadataStoreState.atomFamily('views'))).toEqual({
      current: [],
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: 'deleted-view-hash',
      draftCollectionHash: undefined,
    });
  });

  it('keeps the view hidden until overlapping deletion requests settle', async () => {
    const { result } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 20,
        error: new Error('First request failed'),
      },
      {
        request: destroyRequest,
        delay: 100,
        error: new Error('Second request failed'),
      },
    ]);

    let firstPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    let secondPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      firstPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
      secondPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    await act(async () => {
      await firstPromise;
    });
    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();

    await act(async () => {
      await secondPromise;
    });
    expect(screen.getByText(viewToDestroy.name)).toBeInTheDocument();
  });
});
