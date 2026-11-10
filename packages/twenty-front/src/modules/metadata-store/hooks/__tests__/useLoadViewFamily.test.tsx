import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { useLoadViewFamily } from '@/metadata-store/hooks/useLoadViewFamily';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { removedViewIdsState } from '@/metadata-store/states/removedViewIdsState';
import { viewFamilyHintState } from '@/metadata-store/states/viewFamilyHintState';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { FIND_MY_PRIVATE_VIEWS } from '@/views/graphql/queries/findMyPrivateViews';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query: mockQuery }),
}));

jest.mock('~/utils/sleep', () => ({
  sleep: () => Promise.resolve(),
}));

const PRIVATE_VIEW = {
  __typename: 'View',
  id: 'private-view',
  viewFields: [],
  viewFieldGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  viewGroups: [],
};

const familyResponse = (query: unknown, familyVersion: string) =>
  query === FIND_MY_PRIVATE_VIEWS
    ? {
        data: {
          getMyPrivateViews: { familyVersion, views: [PRIVATE_VIEW] },
        },
      }
    : { data: { getSharedViews: { familyVersion, views: [] } } };

const hintResponse = (hint: string) => ({
  data: {
    minimalMetadata: {
      collectionHashes: [{ collectionName: 'view', hash: hint }],
    },
  },
});

const createSplitModeStore = (hint: string) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    featureFlags: [
      { key: FeatureFlagKey.IS_PRIVATE_METADATA_ENABLED, value: true },
    ],
  } as never);
  store.set(viewFamilyHintState.atom, hint);

  return store;
};

const renderLoadViewFamily = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useLoadViewFamily(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  }).result.current.loadViewFamily;

describe('useLoadViewFamily', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('stages the family under its version when every response matches the hint', async () => {
    const store = createSplitModeStore('h1');

    mockQuery.mockImplementation(({ query }) =>
      Promise.resolve(familyResponse(query, 'h1')),
    );

    await renderLoadViewFamily(store)();

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    expect(viewsEntry.status).toBe('draft-pending');
    expect(viewsEntry.draftCollectionHash).toBe('h1');
  });

  it('never installs a family superseded by a removal while the hint is being confirmed', async () => {
    const store = createSplitModeStore('h0');
    let attempt = 0;

    mockQuery.mockImplementation(({ query }) => {
      if (query === FIND_MINIMAL_METADATA) {
        store.set(viewFamilyLoadEpochState.atom, (epoch) => epoch + 1);
        store.set(removedViewIdsState.atom, ['private-view']);

        return Promise.resolve(hintResponse('h1'));
      }

      return Promise.resolve(
        familyResponse(query, attempt++ < 4 ? 'h1' : `lagging-${attempt}`),
      );
    });

    await expect(renderLoadViewFamily(store)()).rejects.toThrow();

    expect(store.get(metadataStoreState.atomFamily('views')).status).toBe(
      'empty',
    );
    expect(store.get(removedViewIdsState.atom)).toEqual(['private-view']);
  });

  it('never installs a family once split mode is turned off mid-load', async () => {
    const store = createSplitModeStore('h1');

    mockQuery.mockImplementation(({ query }) => {
      store.set(currentWorkspaceState.atom, { featureFlags: [] } as never);

      return Promise.resolve(familyResponse(query, 'h1'));
    });

    await expect(renderLoadViewFamily(store)()).rejects.toThrow();

    expect(store.get(metadataStoreState.atomFamily('views')).status).toBe(
      'empty',
    );
  });
});
