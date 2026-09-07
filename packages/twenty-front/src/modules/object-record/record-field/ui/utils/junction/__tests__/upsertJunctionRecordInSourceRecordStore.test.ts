import { createStore } from 'jotai';

import { upsertJunctionRecordInSourceRecordStore } from '@/object-record/record-field/ui/utils/junction/upsertJunctionRecordInSourceRecordStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

describe('upsertJunctionRecordInSourceRecordStore', () => {
  it('appends a new junction without replacing existing junctions', () => {
    const store = createStore();
    const sourceRecordId = 'source-record-id';
    const existingJunction = {
      id: 'existing-junction-id',
      __typename: 'Junction',
    };
    const newJunction = { id: 'new-junction-id', __typename: 'Junction' };

    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Source',
      junctions: [existingJunction],
    });

    upsertJunctionRecordInSourceRecordStore({
      store,
      sourceRecordId,
      sourceFieldName: 'junctions',
      junctionRecord: newJunction,
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))?.junctions,
    ).toEqual([existingJunction, newJunction]);
  });

  it('enriches an optimistic junction instead of ignoring the same id', () => {
    const store = createStore();
    const sourceRecordId = 'source-record-id';

    store.set(recordStoreFamilyState.atomFamily(sourceRecordId), {
      id: sourceRecordId,
      __typename: 'Source',
      junctions: [{ id: 'junction-id', __typename: 'Junction' }],
    });

    upsertJunctionRecordInSourceRecordStore({
      store,
      sourceRecordId,
      sourceFieldName: 'junctions',
      junctionRecord: {
        id: 'junction-id',
        __typename: 'Junction',
        target: { id: 'target-id', __typename: 'Target' },
      },
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))?.junctions,
    ).toEqual([
      {
        id: 'junction-id',
        __typename: 'Junction',
        target: { id: 'target-id', __typename: 'Target' },
      },
    ]);
  });
});
