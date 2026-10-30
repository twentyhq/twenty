// ADVERSARIAL REPRODUCTION SPEC - NOT MEANT TO BE MERGED.
// Asserts the CURRENT behaviour: a reposition for a record the board has not
// loaded bails out, which makes RecordBoardDataChangedEffect fall back to
// triggerRecordBoardInitialQuery (whole board reset to page 0).
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRepositionRecordsOnBoard } from '@/object-record/record-board/hooks/useRepositionRecordsOnBoard';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INSTANCE_ID = 'view-instance-id';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
const stageFieldMetadataItem = objectMetadataItem.fields.find(
  (field) => field.name === 'stage',
);

if (!stageFieldMetadataItem?.options) {
  throw new Error('opportunity.stage fixture is missing');
}

const STAGE_A = stageFieldMetadataItem.options[0].value;
const STAGE_B = stageFieldMetadataItem.options[1].value;

const GROUP_A: RecordGroupDefinition = {
  id: 'group-a',
  type: RecordGroupDefinitionType.Value,
  title: 'A',
  value: STAGE_A,
  color: 'blue',
  position: 0,
  isVisible: true,
};

const GROUP_B: RecordGroupDefinition = {
  id: 'group-b',
  type: RecordGroupDefinitionType.Value,
  title: 'B',
  value: STAGE_B,
  color: 'red',
  position: 1,
  isVisible: true,
};

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ViewComponentInstanceContext.Provider value={{ instanceId: INSTANCE_ID }}>
        {children}
      </ViewComponentInstanceContext.Provider>
    </JotaiProvider>
  );

const idsAtom = (groupId: string) =>
  recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
    instanceId: INSTANCE_ID,
    familyKey: groupId,
  });

const seed = (store: ReturnType<typeof createStore>) => {
  store.set(recordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }), [
    GROUP_A.id,
    GROUP_B.id,
  ]);
  store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_A.id), GROUP_A);
  store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_B.id), GROUP_B);
  store.set(
    recordIndexGroupFieldMetadataItemComponentState.atomFamily({
      instanceId: INSTANCE_ID,
    }),
    stageFieldMetadataItem,
  );

  // Page 0 of A is loaded; a1..a10 are in the store. a500 lives in the
  // unloaded tail of a 5000-record column.
  const loadedIds = Array.from({ length: 10 }, (_, index) => `a${index + 1}`);
  store.set(idsAtom(GROUP_A.id), loadedIds);
  store.set(idsAtom(GROUP_B.id), []);
  for (const [index, id] of loadedIds.entries()) {
    store.set(recordStoreFamilyState.atomFamily(id), {
      __typename: 'Opportunity',
      id,
      position: index + 1,
      stage: STAGE_A,
    });
  }
};

describe('useRepositionRecordsOnBoard (adversarial)', () => {
  it('BUG 3b: an SSE update for a record in the unloaded tail is not repositionable -> caller resets the whole board', () => {
    const store = createStore();
    seed(store);

    const { result } = renderHook(() => useRepositionRecordsOnBoard(), {
      wrapper: getWrapper(store),
    });

    let repositioned = true;

    act(() => {
      // Another user drags a500 (row 500 of column A, never loaded here)
      // within column A. SSE delivers update-one with updatedFields
      // [{ position: 499.5 }].
      repositioned = result.current.repositionRecordsOnBoard([
        { recordId: 'a500', updatedFields: [{ position: 499.5 }] },
      ]);
    });

    // false => RecordBoardDataChangedEffect calls
    // triggerRecordBoardInitialQuery({ shouldResetScroll: false }) which
    // replaces every column with page 0 and resets the shared offset.
    expect(repositioned).toBe(false);
  });

  it('BUG 3c: a record known to the store (opened in a show page) but not in any column also forces the full reset', () => {
    const store = createStore();
    seed(store);
    store.set(recordStoreFamilyState.atomFamily('a500'), {
      __typename: 'Opportunity',
      id: 'a500',
      position: 500,
      stage: STAGE_A,
    });

    const { result } = renderHook(() => useRepositionRecordsOnBoard(), {
      wrapper: getWrapper(store),
    });

    let repositioned = true;

    act(() => {
      repositioned = result.current.repositionRecordsOnBoard([
        { recordId: 'a500', updatedFields: [{ stage: STAGE_B }] },
      ]);
    });

    expect(repositioned).toBe(false);
  });

  it('BUG 1c: a batch where one record is loaded and one is not is rolled back entirely (no partial apply) and still forces the reset', () => {
    const store = createStore();
    seed(store);

    const { result } = renderHook(() => useRepositionRecordsOnBoard(), {
      wrapper: getWrapper(store),
    });

    let repositioned = true;

    act(() => {
      repositioned = result.current.repositionRecordsOnBoard([
        { recordId: 'a3', updatedFields: [{ stage: STAGE_B }] },
        { recordId: 'a500', updatedFields: [{ stage: STAGE_B }] },
      ]);
    });

    expect(repositioned).toBe(false);
    // Columns untouched (a3 is still in A), but the record store WAS mutated
    // for a3 before the bail-out (upsert happens before the batch commit).
    expect(store.get(idsAtom(GROUP_A.id))).toContain('a3');
    expect(store.get(recordStoreFamilyState.atomFamily('a3'))?.stage).toBe(
      STAGE_B,
    );
  });
});
