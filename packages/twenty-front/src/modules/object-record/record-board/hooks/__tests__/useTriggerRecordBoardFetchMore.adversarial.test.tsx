// ADVERSARIAL REPRODUCTION SPEC - NOT MEANT TO BE MERGED.
// Each test asserts the CURRENT (buggy) behaviour so that a passing test is
// proof of the defect. See scratchpad/pagination/REPORT.md.
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const executeMock = jest.fn();

jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy',
  () => ({
    useRecordIndexGroupsRecordsLazyGroupBy: () => ({
      executeRecordIndexGroupsRecordsLazyGroupBy: (...args: unknown[]) =>
        executeMock(...args),
    }),
  }),
);

jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables',
  () => ({
    useRecordIndexGroupCommonQueryVariables: () => ({
      combinedFilters: {},
      orderBy: [{ position: 'AscNullsFirst' }],
      recordGqlFields: { id: true, position: true, stage: true },
      recordGroupsLimit: 2,
    }),
  }),
);

jest.mock('~/utils/sleep', () => ({
  sleep: () => Promise.resolve(),
}));

const VIEW_INSTANCE_ID = 'instanceId';
const BOARD_INSTANCE_ID = 'board-instance-id';

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

type ServerRecord = { id: string; position: number; stage: string };

// Minimal model of GroupByWithRecordsService.buildRankedRecordsStatement:
// ROW_NUMBER() OVER (PARTITION BY stage ORDER BY position) and
// record_row_number > offset AND record_row_number <= offset + 10.
const buildServer = (serverRecords: ServerRecord[]) => {
  const groupByPage = (offset: number, stages: string[]) =>
    stages.map((stage) => {
      const page = serverRecords
        .filter((record) => record.stage === stage)
        .toSorted((left, right) => left.position - right.position)
        .slice(offset, offset + RECORD_BOARD_QUERY_PAGE_SIZE);

      return {
        __typename: 'OpportunityGroupByConnection',
        groupByDimensionValues: [stage],
        pageInfo: { hasNextPage: true, endCursor: null },
        edges: page.map((record) => ({
          cursor: record.id,
          node: { __typename: 'Opportunity', ...record },
        })),
      };
    });

  return {
    records: serverRecords,
    respond: ({
      variables,
    }: {
      variables: { offsetForRecords: number; filter: Record<string, any> };
    }) => {
      const stages: string[] = variables.filter?.stage?.in ?? [];

      return Promise.resolve({
        data: {
          opportunitiesGroupBy: groupByPage(variables.offsetForRecords, stages),
        },
      });
    },
  };
};

const makeRecords = (stage: string, prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}${index + 1}`,
    position: index + 1,
    stage,
  }));

const viewAtom = <TValue,>(
  componentState: { atomFamily: (key: { instanceId: string }) => TValue },
) => componentState.atomFamily({ instanceId: VIEW_INSTANCE_ID });

const idsAtom = (groupId: string) =>
  recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
    instanceId: VIEW_INSTANCE_ID,
    familyKey: groupId,
  });

const shouldFetchMoreAtom = (groupId: string) =>
  recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
    instanceId: BOARD_INSTANCE_ID,
    familyKey: groupId,
  });

const offsetAtom = () =>
  recordBoardCurrentGroupByQueryOffsetComponentState.atomFamily({
    instanceId: BOARD_INSTANCE_ID,
  });

const isFetchingMoreAtom = () =>
  recordBoardIsFetchingMoreComponentState.atomFamily({
    instanceId: BOARD_INSTANCE_ID,
  });

const seedBoard = ({
  pageZeroByGroup,
}: {
  pageZeroByGroup: Record<string, ServerRecord[]>;
}) => {
  jotaiStore.set(viewAtom(recordGroupIdsComponentState), [
    GROUP_A.id,
    GROUP_B.id,
  ]);
  jotaiStore.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_A.id), GROUP_A);
  jotaiStore.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_B.id), GROUP_B);
  jotaiStore.set(
    viewAtom(recordIndexGroupFieldMetadataItemComponentState),
    stageFieldMetadataItem,
  );

  for (const [groupId, records] of Object.entries(pageZeroByGroup)) {
    jotaiStore.set(
      idsAtom(groupId),
      records.map((record) => record.id),
    );
    jotaiStore.set(
      shouldFetchMoreAtom(groupId),
      records.length >= RECORD_BOARD_QUERY_PAGE_SIZE,
    );
    for (const record of records) {
      jotaiStore.set(recordStoreFamilyState.atomFamily(record.id), {
        __typename: 'Opportunity',
        ...record,
      });
    }
  }

  jotaiStore.set(offsetAtom(), 0);
};

// The wrapper resets the jotai store, and recordGroupDefinitions / the group
// field are captured by the hook's useCallback closure at first render, so the
// board must be seeded between wrapper creation and renderHook.
const renderFetchMore = ({
  pageZeroByGroup,
}: {
  pageZeroByGroup: Record<string, ServerRecord[]>;
}) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  seedBoard({ pageZeroByGroup });

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

  return renderHook(() => useTriggerRecordBoardFetchMore(), {
    wrapper: Wrapper,
  });
};

const countOccurrences = (ids: string[], id: string) =>
  ids.filter((candidate) => candidate === id).length;

describe('useTriggerRecordBoardFetchMore (adversarial, large-scale)', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('BUG 1a: a card dragged into column A is appended AGAIN by the next page (duplicate React key)', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    // User drags b5 (visible in B) to the END of column A: local arrays
    // are patched (useUpdateDroppedRecordOnBoard), server receives
    // { stage: A, position: 11 } (computeNewPositionOfDraggedRecord ->
    // last position + 1). No refetch happens for a reposition
    // (useGetRecordBoardEffectsForUpdateInputs -> 'reposition-records').
    const draggedId = 'b5';
    const draggedServerRecord = { id: draggedId, position: 11, stage: STAGE_A };

    jotaiStore.set(
      idsAtom(GROUP_A.id),
      [...jotaiStore.get(idsAtom(GROUP_A.id)), draggedId],
    );
    jotaiStore.set(
      idsAtom(GROUP_B.id),
      jotaiStore.get(idsAtom(GROUP_B.id)).filter((id) => id !== draggedId),
    );
    jotaiStore.set(recordStoreFamilyState.atomFamily(draggedId), {
      __typename: 'Opportunity',
      ...draggedServerRecord,
    });

    const server = buildServer([
      ...aRecords,
      ...bRecords.filter((record) => record.id !== draggedId),
      draggedServerRecord,
    ]);
    executeMock.mockImplementation(server.respond);

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock.mock.calls[0][0].variables.offsetForRecords).toBe(10);

    const columnAIds = jotaiStore.get(idsAtom(GROUP_A.id));

    // Server row 11 of group A is now b5 (position 11 sorts right after a10).
    // The client already holds b5 at index 10 -> b5 appears twice.
    expect(countOccurrences(columnAIds, draggedId)).toBe(2);
    expect(new Set(columnAIds).size).toBeLessThan(columnAIds.length);
  });

  it('BUG 1b: a card dragged OUT of column B shifts server row numbers, so the next page silently skips one record', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    const draggedId = 'b5';
    const draggedServerRecord = { id: draggedId, position: 11, stage: STAGE_A };

    jotaiStore.set(
      idsAtom(GROUP_A.id),
      [...jotaiStore.get(idsAtom(GROUP_A.id)), draggedId],
    );
    jotaiStore.set(
      idsAtom(GROUP_B.id),
      jotaiStore.get(idsAtom(GROUP_B.id)).filter((id) => id !== draggedId),
    );

    const server = buildServer([
      ...aRecords,
      ...bRecords.filter((record) => record.id !== draggedId),
      draggedServerRecord,
    ]);
    executeMock.mockImplementation(server.respond);

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    const columnBIds = jotaiStore.get(idsAtom(GROUP_B.id));

    // Server group B is now b1..b4,b6..b25 => rows 1..24. Row 10 is b11,
    // the page (rows 11..20) is b12..b21: b11 is never loaded.
    expect(columnBIds).not.toContain('b11');
    expect(columnBIds).toContain('b12');
    expect(columnBIds).toContain('b21');
    // The shared offset moved on, so b11 can never be fetched by a later page.
    expect(jotaiStore.get(offsetAtom())).toBe(10);
  });

  it('BUG 2: a record created by another user between pages (position in the loaded prefix) shifts the page and skips a record; a create in the tail is harmless', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    // Another user / workflow creates "x" at position 3.5 in A (sorts inside
    // the already-loaded prefix). The SSE 'create-one' handler only triggers
    // an initial query when the created position < first loaded position
    // (3.5 > 1), so nothing is refetched.
    const server = buildServer([
      ...aRecords,
      ...bRecords,
      { id: 'x', position: 3.5, stage: STAGE_A },
    ]);
    executeMock.mockImplementation(server.respond);

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    const columnAIds = jotaiStore.get(idsAtom(GROUP_A.id));

    // Rows are now a1,a2,a3,x,a4..a10 (rows 1..11); page rows 11..20 = a10..a19.
    expect(countOccurrences(columnAIds, 'a10')).toBe(2);
    expect(columnAIds).not.toContain('x');
  });

  it('BUG 5: a fetch-more that resolves after the query identifier changed appends stale records to the NEW columns and clobbers the reset offset', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    let resolveInFlight: (value: unknown) => void = () => undefined;
    const inFlight = new Promise((resolve) => {
      resolveInFlight = resolve;
    });

    const staleServer = buildServer([...aRecords, ...bRecords]);
    executeMock.mockImplementation(() => inFlight);

    let fetchMorePromise: Promise<void> = Promise.resolve();

    act(() => {
      fetchMorePromise = result.current.triggerRecordBoardFetchMore();
    });

    expect(jotaiStore.get(isFetchingMoreAtom())).toBe(true);

    // Meanwhile the user changes a filter: RecordBoardQueryEffect runs
    // triggerRecordBoardInitialQuery which replaces every column with page 0
    // of the new query and resets the shared offset to 0.
    const newFilterPageZeroA = ['n1', 'n2', 'n3'];
    jotaiStore.set(idsAtom(GROUP_A.id), newFilterPageZeroA);
    jotaiStore.set(idsAtom(GROUP_B.id), []);
    jotaiStore.set(shouldFetchMoreAtom(GROUP_A.id), false);
    jotaiStore.set(shouldFetchMoreAtom(GROUP_B.id), false);
    jotaiStore.set(offsetAtom(), 0);

    await act(async () => {
      resolveInFlight(
        await staleServer.respond({
          variables: {
            offsetForRecords: 10,
            filter: { stage: { in: [STAGE_A, STAGE_B] } },
          },
        }),
      );
      await fetchMorePromise;
    });

    const columnAIds = jotaiStore.get(idsAtom(GROUP_A.id));

    // Stale page (old filter, rows 11..20) appended after the new page 0.
    expect(columnAIds.slice(0, 3)).toEqual(newFilterPageZeroA);
    expect(columnAIds).toContain('a11');
    expect(columnAIds).toHaveLength(13);
    expect(jotaiStore.get(idsAtom(GROUP_B.id))).toContain('b11');
    // Offset for the NEW query is now 10 although only page 0 of it was loaded.
    expect(jotaiStore.get(offsetAtom())).toBe(10);
    // And the columns the initial query marked as exhausted are re-opened.
    expect(jotaiStore.get(shouldFetchMoreAtom(GROUP_A.id))).toBe(true);
  });

  it('BUG 6: a network error leaves offset, shouldFetchMore and isFetchingMore exactly as before -> the effect re-triggers immediately (no backoff)', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    executeMock.mockRejectedValue(new Error('Network error'));

    for (let attempt = 0; attempt < 5; attempt++) {
      await act(async () => {
        await result.current.triggerRecordBoardFetchMore();
      });

      expect(jotaiStore.get(offsetAtom())).toBe(0);
      expect(jotaiStore.get(isFetchingMoreAtom())).toBe(false);
      expect(jotaiStore.get(shouldFetchMoreAtom(GROUP_A.id))).toBe(true);
    }

    // Nothing in the state distinguishes "failed" from "ready for next page":
    // every RecordBoardQueryEffect dependency is unchanged, and the hook
    // identity changes on every render, so the effect keeps calling.
    expect(executeMock).toHaveBeenCalledTimes(5);
  });

  it('BUG 3: a column that was exhausted at page 0 is never re-opened by fetch-more, even after it grew locally; the shared offset keeps advancing for other columns', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 5);
    const bRecords = makeRecords(STAGE_B, 'b', 45);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords,
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    // Column A grows to 20 records on the server (created elsewhere, SSE
    // dropped), while the user scrolls column B.
    const grownA = makeRecords(STAGE_A, 'a', 20);
    const server = buildServer([...grownA, ...bRecords]);
    executeMock.mockImplementation(server.respond);

    for (let page = 1; page <= 3; page++) {
      await act(async () => {
        await result.current.triggerRecordBoardFetchMore();
      });
    }

    expect(jotaiStore.get(offsetAtom())).toBe(30);
    // Only B was ever requested.
    for (const call of executeMock.mock.calls) {
      expect(call[0].variables.filter.stage.in).toEqual([STAGE_B]);
    }
    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toHaveLength(5);
    expect(jotaiStore.get(shouldFetchMoreAtom(GROUP_A.id))).toBe(false);

    // Even if something flipped A back on, the next page would start at 40
    // and skip A's rows 6..40 forever.
    jotaiStore.set(shouldFetchMoreAtom(GROUP_A.id), true);

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toHaveLength(5);
    expect(jotaiStore.get(shouldFetchMoreAtom(GROUP_A.id))).toBe(false);
  });
});
