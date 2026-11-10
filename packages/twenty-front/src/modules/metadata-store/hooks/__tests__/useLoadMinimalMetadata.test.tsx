import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { viewFamilyHintState } from '@/metadata-store/states/viewFamilyHintState';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query: mockQuery }),
}));

const MINIMAL_RESPONSE = {
  data: {
    minimalMetadata: {
      objectMetadataItems: [],
      views: [{ id: 'removed-private-view' }],
      collectionHashes: [{ collectionName: 'view', hash: 'v1' }],
    },
  },
};

const createSplitModeStore = () => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    featureFlags: [
      { key: FeatureFlagKey.IS_PRIVATE_METADATA_ENABLED, value: true },
    ],
  } as never);

  return store;
};

const renderLoadMinimalMetadata = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useLoadMinimalMetadata(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  }).result.current.loadMinimalMetadata;

describe('useLoadMinimalMetadata', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('records the view family hint and bootstraps views without a hash', async () => {
    const store = createSplitModeStore();

    mockQuery.mockResolvedValue(MINIMAL_RESPONSE);

    await renderLoadMinimalMetadata(store)();

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    expect(store.get(viewFamilyHintState.atom)).toBe('v1');
    expect(viewsEntry.status).toBe('up-to-date');
    expect(viewsEntry.currentCollectionHash).toBeUndefined();
  });

  it('never restores a hint or seeds views from a response older than a family event', async () => {
    const store = createSplitModeStore();

    mockQuery.mockImplementation(() => {
      store.set(viewFamilyLoadEpochState.atom, (epoch) => epoch + 1);
      store.set(viewFamilyHintState.atom, undefined);

      return Promise.resolve(MINIMAL_RESPONSE);
    });

    await renderLoadMinimalMetadata(store)();

    expect(store.get(viewFamilyHintState.atom)).toBeUndefined();
    expect(store.get(metadataStoreState.atomFamily('views')).status).toBe(
      'empty',
    );
  });
});
