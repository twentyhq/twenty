import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY_ID = '20202020-0000-4000-8000-000000000002';
const RENEWAL_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const ONBOARDING_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
// Any relation to company stands in for the thread target's company leg.
const companyTargetField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});
const threadObjectMetadataItem = {
  ...personObjectMetadataItem,
  id: 'agent-chat-thread-metadata-id',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [
    ...personObjectMetadataItem.fields,
    { ...companyTargetField, name: 'lastActivityAt' },
  ],
};
const threadTargetObjectMetadataItem = {
  ...personObjectMetadataItem,
  id: 'agent-chat-thread-target-metadata-id',
  nameSingular: 'agentChatThreadTarget',
  namePlural: 'agentChatThreadTargets',
  fields: [companyTargetField],
};

const buildLink = ({
  id,
  threadId,
  title,
}: {
  id: string;
  threadId: string;
  title: string;
}): AgentChatThreadTargetRecord => ({
  __typename: 'AgentChatThreadTarget',
  id,
  threadId,
  thread: {
    __typename: 'AgentChatThread',
    id: threadId,
    title,
    deletedAt: null,
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
});

// The renewal conversation is linked twice, as a custom leg allows.
const LINKS = [
  buildLink({
    id: 'link-1',
    threadId: RENEWAL_THREAD_ID,
    title: 'Renewal prep',
  }),
  buildLink({
    id: 'link-2',
    threadId: ONBOARDING_THREAD_ID,
    title: 'Onboarding',
  }),
  buildLink({
    id: 'link-3',
    threadId: RENEWAL_THREAD_ID,
    title: 'Renewal prep',
  }),
];

const refetch = jest.fn(() => Promise.resolve());
const fetchMoreRecords = jest.fn(() => Promise.resolve());
const ALL_THREAD_LINKS = [
  { id: 'link-1', threadId: RENEWAL_THREAD_ID },
  { id: 'link-2', threadId: ONBOARDING_THREAD_ID },
  { id: 'link-3', threadId: RENEWAL_THREAD_ID },
  { id: 'link-4', threadId: RENEWAL_THREAD_ID },
];
const fetchAllRecords = jest.fn(() => Promise.resolve(ALL_THREAD_LINKS));
const useLazyFetchAllRecords = jest.fn((_params: unknown) => ({
  fetchAllRecords,
}));
const QUERY_IDENTIFIER = 'chat-threads-for-record-query';
const findManyRecordsResult = {
  records: LINKS,
  loading: false,
  error: undefined,
  refetch,
  fetchMoreRecords,
  hasNextPage: true,
  queryIdentifier: QUERY_IDENTIFIER,
};
const useFindManyRecords = jest.fn((_params: unknown) => ({
  ...findManyRecordsResult,
}));
const useListenToEventsForQuery = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (params: unknown) => useFindManyRecords(params),
}));

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: (params: unknown) => useLazyFetchAllRecords(params),
}));

jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: (params: unknown) =>
    useListenToEventsForQuery(params),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      companyObjectMetadataItem,
      personObjectMetadataItem,
      opportunityObjectMetadataItem,
      threadTargetObjectMetadataItem,
      threadObjectMetadataItem,
    ],
  }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => ({
      junctionObjectMetadata: threadTargetObjectMetadataItem,
      targetFields: [companyTargetField],
    }),
  }),
);

const renderChatThreadsForRecord = ({
  targetObjectNameSingular = 'company',
  store = createStore(),
} = {}) =>
  renderHook(
    () => useChatThreadsForRecord({ id: COMPANY_ID, targetObjectNameSingular }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    },
  ).result;

const dispatchThreadOperation = (
  operation: Parameters<
    typeof dispatchObjectRecordOperationBrowserEvent
  >[0]['operation'],
) =>
  act(() => {
    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: threadObjectMetadataItem,
      operation,
    });
  });

const LINKS_FILTER = { or: [{ companyId: { eq: COMPANY_ID } }] };

describe('useChatThreadsForRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFindManyRecords.mockReturnValue(findManyRecordsResult);
  });

  it("reads the links on the leg of the record's object and listens for new ones", () => {
    renderChatThreadsForRecord();

    expect(useFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'agentChatThreadTarget',
        skip: false,
        filter: LINKS_FILTER,
        orderBy: [{ thread: { lastActivityAt: 'DescNullsLast' } }],
        recordGqlFields: expect.objectContaining({
          thread: expect.objectContaining({
            createdAt: true,
            channelId: true,
          }),
        }),
      }),
    );
    expect(useListenToEventsForQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        operationSignature: {
          objectNameSingular: 'agentChatThreadTarget',
          variables: { filter: LINKS_FILTER },
        },
        skip: false,
      }),
    );
  });

  it('lists each conversation once', () => {
    const result = renderChatThreadsForRecord();

    expect(result.current.threads.map(({ title }) => title)).toEqual([
      'Renewal prep',
      'Onboarding',
    ]);
  });

  it('finds every link to a conversation before detaching, including links outside the loaded page', async () => {
    const result = renderChatThreadsForRecord();

    expect(fetchAllRecords).not.toHaveBeenCalled();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).resolves.toEqual(['link-1', 'link-3', 'link-4']);

    expect(useLazyFetchAllRecords).toHaveBeenCalledWith({
      objectNameSingular: 'agentChatThreadTarget',
      filter: LINKS_FILTER,
      recordGqlFields: { id: true, threadId: true },
      fetchPolicy: 'network-only',
      maximumRequests: Number.POSITIVE_INFINITY,
    });
  });

  it('rejects link lookup errors instead of returning a partial set', async () => {
    fetchAllRecords.mockRejectedValueOnce(new Error('Link lookup failed'));
    const result = renderChatThreadsForRecord();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).rejects.toThrow('Link lookup failed');
  });

  it('reads nothing for an object conversations cannot be attached to', async () => {
    const result = renderChatThreadsForRecord({
      targetObjectNameSingular: 'opportunity',
    });

    act(() => {
      void result.current.fetchMoreThreads();
    });

    expect(useFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(fetchMoreRecords).not.toHaveBeenCalled();
    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).resolves.toEqual([]);
    expect(fetchAllRecords).not.toHaveBeenCalled();
  });

  it('loads the next page of linked conversations', async () => {
    const result = renderChatThreadsForRecord();

    await act(async () => {
      await result.current.fetchMoreThreads();
    });

    expect(fetchMoreRecords).toHaveBeenCalledTimes(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.queryIdentifier).toBe(QUERY_IDENTIFIER);
  });

  it.each([
    { loading: true, hasNextPage: true },
    { loading: false, hasNextPage: false },
  ])(
    'skips pagination while loading=$loading and hasNextPage=$hasNextPage',
    ({ loading, hasNextPage }) => {
      useFindManyRecords.mockReturnValue({
        ...findManyRecordsResult,
        loading,
        hasNextPage,
      });
      const result = renderChatThreadsForRecord();

      act(() => {
        void result.current.fetchMoreThreads();
      });

      expect(fetchMoreRecords).not.toHaveBeenCalled();
    },
  );

  it('does not overlap a page request already pending for this query', () => {
    const store = createStore();
    store.set(
      isFetchingMoreRecordsFamilyState.atomFamily(QUERY_IDENTIFIER),
      true,
    );
    const result = renderChatThreadsForRecord({ store });

    act(() => {
      void result.current.fetchMoreThreads();
    });

    expect(result.current.isFetchingMoreThreads).toBe(true);
    expect(fetchMoreRecords).not.toHaveBeenCalled();
  });

  it('reads the links again when a conversation is filed under a record', () => {
    renderChatThreadsForRecord();

    act(() => {
      dispatchObjectRecordOperationBrowserEvent({
        objectMetadataItem: threadTargetObjectMetadataItem,
        operation: {
          type: 'create-one',
          createdRecord: { id: 'link-4', threadId: RENEWAL_THREAD_ID },
        },
      });
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { type: 'delete-one', deletedRecordId: ONBOARDING_THREAD_ID },
    {
      type: 'restore-one',
      restoredRecord: { id: ONBOARDING_THREAD_ID },
    },
    { type: 'destroy-one' },
  ] as const)(
    'reads the links again when a conversation is $type-d',
    (operation) => {
      renderChatThreadsForRecord();

      dispatchThreadOperation(operation);

      expect(refetch).toHaveBeenCalledTimes(1);
    },
  );

  it('leaves renames to the record cache', () => {
    renderChatThreadsForRecord();

    dispatchThreadOperation({
      type: 'update-one',
      result: {
        updateInput: {
          recordId: RENEWAL_THREAD_ID,
          updatedFields: [{ title: 'Renewal call' }],
        },
      },
    });

    expect(refetch).not.toHaveBeenCalled();
  });
});
