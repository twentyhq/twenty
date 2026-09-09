import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
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
const otherView = { ...viewToDestroy, id: 'other-view-id', name: 'Other view' };
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
      setTestViewsInMetadataStore(initializedStore, [viewToDestroy, otherView]);
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
  it('removes the view immediately and keeps it removed after success', async () => {
    const { result, store } = renderViewDeletion([
      {
        request: destroyRequest,
        delay: 100,
        result: { data: { destroyView: true } },
      },
    ]);
    const viewsStoreAtom = metadataStoreState.atomFamily('views');
    expect(screen.getByText(viewToDestroy.name)).toBeInTheDocument();

    let destroyPromise: ReturnType<typeof result.current.performViewApiDestroy>;
    act(() => {
      destroyPromise = result.current.performViewApiDestroy({
        id: viewToDestroy.id,
      });
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    expect(screen.getByText(otherView.name)).toBeInTheDocument();
    expect(store.get(viewsStoreAtom).current).toEqual([
      expect.objectContaining({ id: otherView.id }),
    ]);

    await act(async () => {
      expect((await destroyPromise).status).toBe('successful');
    });

    expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
    expect(screen.getByText(otherView.name)).toBeInTheDocument();
    expect(store.get(viewsStoreAtom).current).toEqual([
      expect.objectContaining({ id: otherView.id }),
    ]);
  });

  it.each([
    ['network', { error: new Error('Failed to destroy view') }],
    [
      'GraphQL',
      { result: { errors: [new GraphQLError('Deletion rejected')] } },
    ],
  ])(
    'restores the views snapshot after a %s failure',
    async (_kind, failure) => {
      const { result, store } = renderViewDeletion([
        { request: destroyRequest, delay: 100, ...failure },
      ]);
      const viewsStoreAtom = metadataStoreState.atomFamily('views');
      const previousViewsEntry = store.get(viewsStoreAtom);

      let destroyPromise: ReturnType<
        typeof result.current.performViewApiDestroy
      >;
      act(() => {
        destroyPromise = result.current.performViewApiDestroy({
          id: viewToDestroy.id,
        });
      });

      expect(screen.queryByText(viewToDestroy.name)).not.toBeInTheDocument();
      expect(screen.getByText(otherView.name)).toBeInTheDocument();

      await act(async () => {
        expect((await destroyPromise).status).toBe('failed');
      });

      expect(screen.getByText(viewToDestroy.name)).toBeInTheDocument();
      expect(screen.getByText(otherView.name)).toBeInTheDocument();
      expect(store.get(viewsStoreAtom)).toEqual(previousViewsEntry);
    },
  );
});
