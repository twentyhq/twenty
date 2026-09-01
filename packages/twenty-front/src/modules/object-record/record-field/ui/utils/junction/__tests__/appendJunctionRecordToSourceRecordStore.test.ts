import { createStore } from 'jotai';

import { appendJunctionRecordToSourceRecordStore } from '@/object-record/record-field/ui/utils/junction/appendJunctionRecordToSourceRecordStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

describe('appendJunctionRecordToSourceRecordStore', () => {
  it('appends a junction once without replacing existing junctions', () => {
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

    appendJunctionRecordToSourceRecordStore({
      store,
      sourceRecordId,
      sourceFieldName: 'junctions',
      junctionRecord: newJunction,
    });
    appendJunctionRecordToSourceRecordStore({
      store,
      sourceRecordId,
      sourceFieldName: 'junctions',
      junctionRecord: newJunction,
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(sourceRecordId))?.junctions,
    ).toEqual([existingJunction, newJunction]);
  });
});
