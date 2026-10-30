import { createStore } from 'jotai';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreGraphqlFilterFromStore } from '@/context-store/utils/computeContextStoreGraphqlFilterFromStore';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

function mockGetPersonObjectMetadataItem(): EnrichedObjectMetadataItem {
  return jest
    .requireActual('~/testing/utils/getTestEnrichedObjectMetadataItemsMock')
    .getTestEnrichedObjectMetadataItemsMock()
    .find((item: EnrichedObjectMetadataItem) => item.nameSingular === 'person');
}

const personObjectMetadataItem = mockGetPersonObjectMetadataItem();

jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => ({
  objectMetadataItemsSelector: {
    atom: jest.requireActual('jotai').atom([mockGetPersonObjectMetadataItem()]),
  },
}));

jest.mock(
  '@/object-metadata/states/flattenedFieldMetadataItemsSelector',
  () => ({
    flattenedFieldMetadataItemsSelector: {
      atom: jest
        .requireActual('jotai')
        .atom(mockGetPersonObjectMetadataItem().fields),
    },
  }),
);

const CONTEXT_STORE_INSTANCE_ID = 'context-store-instance-id';

const buildStore = ({
  objectMetadataItemId,
  targetedRecordsRule,
}: {
  objectMetadataItemId: string | undefined;
  targetedRecordsRule:
    | { mode: 'selection'; selectedRecordIds: string[] }
    | { mode: 'exclusion'; excludedRecordIds: string[] };
}) => {
  const store = createStore();

  store.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: CONTEXT_STORE_INSTANCE_ID,
    }),
    objectMetadataItemId,
  );
  store.set(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: CONTEXT_STORE_INSTANCE_ID,
    }),
    targetedRecordsRule,
  );

  return store;
};

describe('computeContextStoreGraphqlFilterFromStore', () => {
  it('should match the selected records by id', () => {
    const store = buildStore({
      objectMetadataItemId: personObjectMetadataItem.id,
      targetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: ['record-1', 'record-2'],
      },
    });

    expect(
      computeContextStoreGraphqlFilterFromStore({
        store,
        contextStoreInstanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
    ).toEqual({ id: { in: ['record-1', 'record-2'] } });
  });

  it('should describe Select all, which has no ids, by what it leaves out', () => {
    const store = buildStore({
      objectMetadataItemId: personObjectMetadataItem.id,
      targetedRecordsRule: {
        mode: 'exclusion',
        excludedRecordIds: ['record-3'],
      },
    });

    expect(
      computeContextStoreGraphqlFilterFromStore({
        store,
        contextStoreInstanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
    ).toEqual({
      and: expect.arrayContaining([{ not: { id: { in: ['record-3'] } } }]),
    });
  });

  it('should return null when the context store is not on an object', () => {
    const store = buildStore({
      objectMetadataItemId: undefined,
      targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
    });

    expect(
      computeContextStoreGraphqlFilterFromStore({
        store,
        contextStoreInstanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
    ).toBeNull();
  });
});
