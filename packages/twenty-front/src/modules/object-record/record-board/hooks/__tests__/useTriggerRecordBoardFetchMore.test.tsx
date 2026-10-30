import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardFetchMoreFailureCountComponentState } from '@/object-record/record-board/states/recordBoardFetchMoreFailureCountComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardQueryGenerationComponentState } from '@/object-record/record-board/states/recordBoardQueryGenerationComponentState';
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
import { sleep } from '~/utils/sleep';

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
  sleep: jest.fn(() => Promise.resolve()),
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

const viewAtom = <TValue,>(componentState: {
  atomFamily: (key: { instanceId: string }) => TValue;
}) => componentState.atomFamily({ instanceId: VIEW_INSTANCE_ID });

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
  jotaiStore.set(
    recordGroupDefinitionFamilyState.atomFamily(GROUP_A.id),
    GROUP_A,
  );
  jotaiStore.set(
    recordGroupDefinitionFamilyState.atomFamily(GROUP_B.id),
    GROUP_B,
  );
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

const generationAtom = () =>
  recordBoardQueryGenerationComponentState.atomFamily({
    instanceId: BOARD_INSTANCE_ID,
  });

const failureCountAtom = () =>
  recordBoardFetchMoreFailureCountComponentState.atomFamily({
    instanceId: BOARD_INSTANCE_ID,
  });

describe('useTriggerRecordBoardFetchMore', () => {
  beforeEach(() => {
    executeMock.mockReset();
    jest.mocked(sleep).mockClear();
  });

  it('does not append a record the column already holds when a later page returns it', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    // b5 was dragged to the end of column A: local arrays are patched and the
    // server now ranks it as row 11 of A, which is the first row of the next page
    const draggedId = 'b5';
    const draggedServerRecord = { id: draggedId, position: 11, stage: STAGE_A };

    jotaiStore.set(idsAtom(GROUP_A.id), [
      ...jotaiStore.get(idsAtom(GROUP_A.id)),
      draggedId,
    ]);
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

    const columnAIds = jotaiStore.get(idsAtom(GROUP_A.id));

    expect(columnAIds.filter((id) => id === draggedId)).toHaveLength(1);
    expect(new Set(columnAIds).size).toBe(columnAIds.length);
    expect(columnAIds).toEqual([
      ...aRecords.slice(0, 10).map((record) => record.id),
      draggedId,
      ...aRecords.slice(10, 19).map((record) => record.id),
    ]);
  });

  it('applies the whole page without sleeping between columns', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);
    const bRecords = makeRecords(STAGE_B, 'b', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: {
        [GROUP_A.id]: aRecords.slice(0, 10),
        [GROUP_B.id]: bRecords.slice(0, 10),
      },
    });

    executeMock.mockImplementation(
      buildServer([...aRecords, ...bRecords]).respond,
    );

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    expect(sleep).not.toHaveBeenCalled();
    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toHaveLength(20);
    expect(jotaiStore.get(idsAtom(GROUP_B.id))).toHaveLength(20);
    expect(jotaiStore.get(offsetAtom())).toBe(10);
  });

  it('discards a page that resolves after an initial query replaced the board', async () => {
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

    executeMock.mockImplementation(() => inFlight);

    let fetchMorePromise: Promise<void> = Promise.resolve();

    act(() => {
      fetchMorePromise = result.current.triggerRecordBoardFetchMore();
    });

    expect(jotaiStore.get(isFetchingMoreAtom())).toBe(true);

    // The initial query bumps the generation and rewrites every column with page 0 of a new filter
    const newPageZero = ['n1', 'n2', 'n3'];

    jotaiStore.set(generationAtom(), jotaiStore.get(generationAtom()) + 1);
    jotaiStore.set(idsAtom(GROUP_A.id), newPageZero);
    jotaiStore.set(idsAtom(GROUP_B.id), []);
    jotaiStore.set(offsetAtom(), 0);

    const staleServer = buildServer([...aRecords, ...bRecords]);

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

    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toEqual(newPageZero);
    expect(jotaiStore.get(idsAtom(GROUP_B.id))).toEqual([]);
    expect(jotaiStore.get(offsetAtom())).toBe(0);
    expect(jotaiStore.get(isFetchingMoreAtom())).toBe(false);
  });

  it('backs off exponentially after failed pages and resets after a success', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: { [GROUP_A.id]: aRecords.slice(0, 10) },
    });

    executeMock.mockImplementation(() => Promise.reject(new Error('network')));

    for (let attempt = 0; attempt < 3; attempt++) {
      await act(async () => {
        await result.current.triggerRecordBoardFetchMore();
      });
    }

    expect(jest.mocked(sleep).mock.calls.map(([delay]) => delay)).toEqual([
      1000, 2000, 4000,
    ]);
    expect(jotaiStore.get(failureCountAtom())).toBe(3);
    expect(jotaiStore.get(offsetAtom())).toBe(0);
    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toHaveLength(10);

    executeMock.mockImplementation(buildServer(aRecords).respond);

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    expect(jotaiStore.get(failureCountAtom())).toBe(0);
    expect(jotaiStore.get(offsetAtom())).toBe(10);
    expect(jotaiStore.get(idsAtom(GROUP_A.id))).toHaveLength(20);
  });

  it('keeps the fetching flag raised while the retry backoff is pending', async () => {
    const aRecords = makeRecords(STAGE_A, 'a', 25);

    const { result } = renderFetchMore({
      pageZeroByGroup: { [GROUP_A.id]: aRecords.slice(0, 10) },
    });

    let resolveBackoff: () => void = () => undefined;

    jest.mocked(sleep).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveBackoff = resolve;
        }),
    );
    executeMock.mockImplementation(() => Promise.reject(new Error('network')));

    let fetchMorePromise: Promise<void> = Promise.resolve();

    await act(async () => {
      fetchMorePromise = result.current.triggerRecordBoardFetchMore();
      await Promise.resolve();
    });

    expect(jotaiStore.get(isFetchingMoreAtom())).toBe(true);

    await act(async () => {
      resolveBackoff();
      await fetchMorePromise;
    });

    expect(jotaiStore.get(isFetchingMoreAtom())).toBe(false);
  });
});
