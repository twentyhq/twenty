import { act, render } from '@testing-library/react';
import { type DocumentNode } from 'graphql';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { FieldMetadataType } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { MinimalMetadataLoadEffect } from '@/metadata-store/effect-components/MinimalMetadataLoadEffect';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { fieldMetadataItemsSelector } from '@/metadata-store/states/fieldMetadataItemsSelector';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
} from '@/metadata-store/states/metadataStoreState';
import { splitObjectMetadataGqlResponse } from '@/metadata-store/utils/splitObjectMetadataGqlResponse';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { AllMetadataName } from '~/generated-metadata/graphql';
import { mockedMinimalMetadata } from '~/testing/mock-data/generated/metadata/minimal/mock-minimal-metadata';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockQuery = jest.fn<
  Promise<{ data: unknown }>,
  [{ query: DocumentNode }]
>();
const mockClient = { query: mockQuery };

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => mockClient,
}));

const COLLECTION_HASH = 'initial-hash';
const UPDATED_COLLECTION_HASH = 'updated-hash';
const DELETED_REPRESENTATIVE_ID = 'deleted-representative';

const SERVER_SNAPSHOT = splitObjectMetadataGqlResponse(
  mockedStandardObjectMetadataQueryResult,
);

const advanceResync = async () => {
  await act(async () => {
    jest.advanceTimersByTime(SSE_RESYNC_DEBOUNCE_TIME_IN_MS);
  });
};

const dispatchEvent = (
  event: MetadataOperationBrowserEventDetail<Record<string, unknown>>,
) => {
  act(() => dispatchMetadataOperationBrowserEvent(event));
};

const createMetadataStore = () => {
  const store = createStore();

  for (const key of ALL_METADATA_ENTITY_KEYS) {
    store.set(metadataStoreState.atomFamily(key), {
      current: [],
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: COLLECTION_HASH,
    });
  }

  for (const [key, current] of [
    ['objectMetadataItems', SERVER_SNAPSHOT.flatObjects],
    ['fieldMetadataItems', SERVER_SNAPSHOT.flatFields],
    ['indexMetadataItems', SERVER_SNAPSHOT.flatIndexes],
  ] as const) {
    store.set(metadataStoreState.atomFamily(key), (entry) => ({
      ...entry,
      current: [...current],
    }));
  }

  store.set(isCookieAuthActiveState.atom, true);
  store.set(isCurrentUserLoadedState.atom, true);
  store.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  return store;
};

const renderEffects = (store: ReturnType<typeof createStore>) =>
  render(
    <JotaiProvider store={store}>
      <MemoryRouter>
        <StrictMode>
          <MetadataStoreSSEEffect />
          <MinimalMetadataLoadEffect />
        </StrictMode>
      </MemoryRouter>
    </JotaiProvider>,
  );

const expectActivityJunctionsToResolve = (
  store: ReturnType<typeof createStore>,
) => {
  const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

  for (const objectName of ['note', 'task']) {
    const objectMetadata = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === objectName,
    );

    if (!objectMetadata) {
      throw new Error(`Missing ${objectName} metadata`);
    }

    expect(
      getObjectMorphJunctionConfig({ objectMetadata, objectMetadataItems }),
    ).not.toBeNull();
  }
};

describe('MetadataStoreSSEEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockQuery.mockReset();
    mockQuery.mockImplementation(async ({ query }) => {
      if (query === FIND_MINIMAL_METADATA) {
        return {
          data: {
            minimalMetadata: {
              ...mockedMinimalMetadata,
              collectionHashes: Object.values(AllMetadataName).map(
                (collectionName) => ({
                  collectionName,
                  hash: COLLECTION_HASH,
                }),
              ),
            },
          },
        };
      }

      if (query === FIND_MANY_OBJECT_METADATA_ITEMS) {
        return { data: mockedStandardObjectMetadataQueryResult };
      }

      throw new Error('Unexpected metadata query');
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['create', 'update', 'delete'] as const)(
    'keeps the complete snapshot and coalesces object, field and index %s events into one resync',
    async (type) => {
      const store = createMetadataStore();
      renderEffects(store);
      await act(async () => {});
      mockQuery.mockClear();

      const version = store.get(metadataLoadedVersionState.atom);
      const fieldsBefore = store.get(fieldMetadataItemsSelector.atom);
      const record = fieldsBefore.find(
        ({ type }) => type === FieldMetadataType.MORPH_RELATION,
      )!;

      for (const metadataName of [
        'objectMetadata',
        'fieldMetadata',
        'index',
      ] as const) {
        dispatchEvent({
          metadataName,
          operation:
            type === 'create'
              ? { type, createdRecord: { ...record, name: 'rawMorphRow' } }
              : type === 'update'
                ? { type, updatedRecord: { ...record, name: 'rawMorphRow' } }
                : { type, deletedRecordId: record.id },
          updatedCollectionHash: UPDATED_COLLECTION_HASH,
        });
      }

      expect(store.get(fieldMetadataItemsSelector.atom)).toEqual(fieldsBefore);
      expect(
        store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
          .currentCollectionHash,
      ).toBe(COLLECTION_HASH);
      expectActivityJunctionsToResolve(store);

      await advanceResync();

      expect(store.get(metadataLoadedVersionState.atom)).toBe(version + 1);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ query: FIND_MINIMAL_METADATA }),
      );
    },
  );

  it('refetches the server representative after deletion without dropping the note or task junction', async () => {
    const store = createMetadataStore();
    const fields = store.get(fieldMetadataItemsSelector.atom);
    const representative = fields.find(
      ({ type }) => type === FieldMetadataType.MORPH_RELATION,
    )!;

    store.set(metadataStoreState.atomFamily('fieldMetadataItems'), (entry) => ({
      ...entry,
      current: fields.map((field) =>
        field.id === representative.id
          ? { ...field, id: DELETED_REPRESENTATIVE_ID }
          : field,
      ),
    }));

    renderEffects(store);
    await act(async () => {});
    mockQuery.mockClear();
    mockQuery.mockImplementationOnce(async () => ({
      data: {
        minimalMetadata: {
          ...mockedMinimalMetadata,
          collectionHashes: Object.values(AllMetadataName).map(
            (collectionName) => ({
              collectionName,
              hash:
                collectionName === AllMetadataName.fieldMetadata
                  ? UPDATED_COLLECTION_HASH
                  : COLLECTION_HASH,
            }),
          ),
        },
      },
    }));

    dispatchEvent({
      metadataName: 'fieldMetadata',
      operation: { type: 'delete', deletedRecordId: DELETED_REPRESENTATIVE_ID },
      updatedCollectionHash: UPDATED_COLLECTION_HASH,
    });

    expectActivityJunctionsToResolve(store);
    await advanceResync();

    expect(store.get(fieldMetadataItemsSelector.atom)).toEqual(
      SERVER_SNAPSHOT.flatFields,
    );
    expectActivityJunctionsToResolve(store);
    expect(
      store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
        .currentCollectionHash,
    ).toBe(UPDATED_COLLECTION_HASH);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('queues changes received during a fetch and finishes with the latest server snapshot', async () => {
    const store = createMetadataStore();
    store.set(metadataStoreState.atomFamily('fieldMetadataItems'), (entry) => ({
      ...entry,
      currentCollectionHash: 'stale-hash',
    }));

    let resolveFirstObjectsQuery!: (result: { data: unknown }) => void;
    const firstObjectsQuery = new Promise<{ data: unknown }>((resolve) => {
      resolveFirstObjectsQuery = resolve;
    });
    const defaultQuery = mockQuery.getMockImplementation()!;
    mockQuery.mockImplementation((options) =>
      options.query === FIND_MANY_OBJECT_METADATA_ITEMS
        ? firstObjectsQuery
        : defaultQuery(options),
    );

    renderEffects(store);
    await act(async () => {});
    expect(mockQuery).toHaveBeenCalledTimes(2);

    const latestObjects = {
      ...mockedStandardObjectMetadataQueryResult,
      objects: {
        ...mockedStandardObjectMetadataQueryResult.objects,
        edges: mockedStandardObjectMetadataQueryResult.objects.edges.map(
          (edge) => ({
            ...edge,
            node: {
              ...edge.node,
              labelSingular: `Updated ${edge.node.labelSingular}`,
            },
          }),
        ),
      },
    };
    mockQuery.mockImplementation(async ({ query }) => {
      if (query === FIND_MINIMAL_METADATA) {
        return {
          data: {
            minimalMetadata: {
              ...mockedMinimalMetadata,
              collectionHashes: Object.values(AllMetadataName).map(
                (collectionName) => ({
                  collectionName,
                  hash:
                    collectionName === AllMetadataName.objectMetadata
                      ? UPDATED_COLLECTION_HASH
                      : COLLECTION_HASH,
                }),
              ),
            },
          },
        };
      }

      return { data: latestObjects };
    });

    for (let index = 0; index < 3; index++) {
      dispatchEvent({
        metadataName: 'objectMetadata',
        operation: { type: 'update', updatedRecord: { id: 'updated-object' } },
        updatedCollectionHash: UPDATED_COLLECTION_HASH,
      });
      await advanceResync();
    }

    expect(mockQuery).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveFirstObjectsQuery({
        data: mockedStandardObjectMetadataQueryResult,
      });
    });

    expect(mockQuery).toHaveBeenCalledTimes(4);
    expect(
      store.get(metadataStoreState.atomFamily('objectMetadataItems')),
    ).toMatchObject({
      current: splitObjectMetadataGqlResponse(latestObjects).flatObjects,
      currentCollectionHash: UPDATED_COLLECTION_HASH,
    });
    expectActivityJunctionsToResolve(store);
  });

  it('continues to apply unrelated metadata events immediately', async () => {
    const store = createMetadataStore();
    renderEffects(store);
    await act(async () => {});
    mockQuery.mockClear();

    dispatchEvent({
      metadataName: 'navigationMenuItem',
      operation: { type: 'create', createdRecord: { id: 'navigation-item' } },
      updatedCollectionHash: UPDATED_COLLECTION_HASH,
    });

    expect(
      store.get(metadataStoreState.atomFamily('navigationMenuItems')),
    ).toMatchObject({
      current: [{ id: 'navigation-item' }],
      currentCollectionHash: UPDATED_COLLECTION_HASH,
    });
    await advanceResync();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
