// ADVERSARIAL REPRODUCTION SPEC - NOT MEANT TO BE MERGED.
// Asserts the CURRENT behaviour of the board's reaction to record operations
// (local or SSE), so a passing test documents the defect. See
// scratchpad/realtime/REPORT.md.
import { renderHook } from '@testing-library/react';
import type { Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';

import { useGetRecordBoardEffectsForUpdateInputs } from '@/object-record/record-board/hooks/useGetRecordBoardEffectsForUpdateInputs';
import { useRepositionRecordsOnBoard } from '@/object-record/record-board/hooks/useRepositionRecordsOnBoard';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const VIEW_INSTANCE_ID = 'instanceId';
const RECORD_INDEX_ID = 'recordIndexId';
const BOARD_INSTANCE_ID = 'board-instance-id';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
const stageFieldMetadataItem = objectMetadataItem.fields.find(
  (field) => field.name === 'stage',
);
const amountFieldMetadataItem = objectMetadataItem.fields.find(
  (field) => field.name === 'amount',
);

if (!stageFieldMetadataItem?.options || !amountFieldMetadataItem) {
  throw new Error('opportunity fixture is missing stage/amount');
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

const seedGroups = (store: Store) => {
  store.set(
    recordGroupIdsComponentState.atomFamily({ instanceId: VIEW_INSTANCE_ID }),
    [GROUP_A.id, GROUP_B.id],
  );
  store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_A.id), GROUP_A);
  store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_B.id), GROUP_B);
  store.set(
    recordIndexGroupFieldMetadataItemComponentState.atomFamily({
      instanceId: VIEW_INSTANCE_ID,
    }),
    stageFieldMetadataItem,
  );
};

const renderWithBoardWrappers = <TResult,>(
  hook: () => TResult,
  seed: (store: Store) => void,
) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      seedGroups(store);
      seed(store);
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataWrapper>
      <JestRecordIndexContextProviderWrapper
        objectMetadataItem={objectMetadataItem}
      >
        <RecordBoardComponentInstanceContext.Provider
          value={{ instanceId: BOARD_INSTANCE_ID }}
        >
          {children}
        </RecordBoardComponentInstanceContext.Provider>
      </JestRecordIndexContextProviderWrapper>
    </MetadataWrapper>
  );

  return renderHook(hook, { wrapper: Wrapper });
};

const STAGE_IS_NOT_LOST_FILTER = {
  id: 'filter-stage',
  fieldMetadataId: stageFieldMetadataItem.id,
  value: '["LOST"]',
  displayValue: 'Lost',
  type: 'SELECT' as const,
  operand: ViewFilterOperand.IS_NOT,
  label: 'Stage',
};

describe('record board reaction to update operations (adversarial, realtime)', () => {
  it('a drag that only changes stage+position is a cheap reposition on an unfiltered board', () => {
    const { result } = renderWithBoardWrappers(
      () => useGetRecordBoardEffectsForUpdateInputs(),
      () => {},
    );

    expect(
      result.current.getRecordBoardEffectsForUpdateInputs([
        {
          recordId: 'opp-1',
          updatedFields: [{ stage: STAGE_B }, { position: 3 }],
        },
      ]),
    ).toBe('reposition-records');
  });

  it('the same drag forces a FULL reload when the view filters on the group field ("Pipeline excluding Lost")', () => {
    const { result } = renderWithBoardWrappers(
      () => useGetRecordBoardEffectsForUpdateInputs(),
      (store) => {
        store.set(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: RECORD_INDEX_ID,
          }),
          [STAGE_IS_NOT_LOST_FILTER],
        );
      },
    );

    expect(
      result.current.getRecordBoardEffectsForUpdateInputs([
        {
          recordId: 'opp-1',
          updatedFields: [{ stage: STAGE_B }, { position: 3 }],
        },
      ]),
    ).toBe('trigger-initial-query');
  });

  it('an inline edit of a sorted field (amount) forces a FULL reload', () => {
    const { result } = renderWithBoardWrappers(
      () => useGetRecordBoardEffectsForUpdateInputs(),
      (store) => {
        store.set(
          currentRecordSortsComponentState.atomFamily({
            instanceId: RECORD_INDEX_ID,
          }),
          [
            {
              id: 'sort-amount',
              fieldMetadataId: amountFieldMetadataItem.id,
              direction: 'asc',
            },
          ],
        );
      },
    );

    expect(
      result.current.getRecordBoardEffectsForUpdateInputs([
        {
          recordId: 'opp-1',
          updatedFields: [
            { amount: { amountMicros: 1000, currencyCode: 'USD' } },
          ],
        },
      ]),
    ).toBe('trigger-initial-query');
  });

  it('a remote (SSE) reposition of a record this client has NOT loaded bails out => caller falls back to a FULL reload', () => {
    const { result } = renderWithBoardWrappers(
      () => useRepositionRecordsOnBoard(),
      (store) => {
        store.set(
          recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
            instanceId: VIEW_INSTANCE_ID,
            familyKey: GROUP_A.id,
          }),
          ['opp-loaded-1'],
        );
        store.set(recordStoreFamilyState.atomFamily('opp-loaded-1'), {
          __typename: 'Opportunity',
          id: 'opp-loaded-1',
          position: 1,
          stage: STAGE_A,
        });
      },
    );

    // A colleague drags a card that sits on page 3 of column B on their
    // screen; this client only has page 1 loaded, so the record is unknown.
    expect(
      result.current.repositionRecordsOnBoard([
        {
          recordId: 'opp-not-loaded-here',
          updatedFields: [{ stage: STAGE_A }, { position: 0.5 }],
        },
      ]),
    ).toBe(false);

    // A batch where the FIRST record is loaded but a later one is not still
    // bails out as a whole (update-many of 100 records from an import).
    expect(
      result.current.repositionRecordsOnBoard([
        { recordId: 'opp-loaded-1', updatedFields: [{ position: 2 }] },
        { recordId: 'opp-not-loaded-here', updatedFields: [{ position: 3 }] },
      ]),
    ).toBe(false);
  });
});
