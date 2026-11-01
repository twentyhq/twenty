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
const buildLinksPage = ({
  linkIds,
  hasNextPage = false,
  endCursor = 'last-link-cursor',
}: {
  linkIds: string[];
  hasNextPage?: boolean;
  endCursor?: string;
}) => ({
  data: {
    agentChatThreadTargets: {
      edges: linkIds.map((id) => ({ node: { id } })),
      pageInfo: { hasNextPage, endCursor },
    },
  },
});
const query = jest.fn();
const FIND_THREAD_LINKS_QUERY = {};
const useFindManyRecordsQuery = jest.fn((_params: unknown) => ({
  findManyRecordsQuery: FIND_THREAD_LINKS_QUERY,
}));
const useObjectPermissionsForObject = jest.fn(() => ({
  canReadObjectRecords: true,
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

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query }),
}));

jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: (params: unknown) => useFindManyRecordsQuery(params),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => useObjectPermissionsForObject(),
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
      sourceJoinColumnName: 'threadId',
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
    useObjectPermissionsForObject.mockReturnValue({
      canReadObjectRecords: true,
    });
    query.mockResolvedValue(
      buildLinksPage({ linkIds: ['link-1', 'link-3', 'link-4'] }),
    );
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
    query
      .mockResolvedValueOnce(
        buildLinksPage({
          linkIds: ['link-1', 'link-3'],
          hasNextPage: true,
          endCursor: 'first-links-page',
        }),
      )
      .mockResolvedValueOnce(buildLinksPage({ linkIds: ['link-4'] }));
    const result = renderChatThreadsForRecord();

    expect(query).not.toHaveBeenCalled();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).resolves.toEqual(['link-1', 'link-3', 'link-4']);

    expect(useFindManyRecordsQuery).toHaveBeenCalledWith({
      objectNameSingular: 'agentChatThreadTarget',
      recordGqlFields: { id: true, threadId: true },
    });
    const filter = {
      and: [LINKS_FILTER, { threadId: { eq: RENEWAL_THREAD_ID } }],
    };

    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(1, {
      query: FIND_THREAD_LINKS_QUERY,
      variables: { filter, limit: 30, lastCursor: undefined },
      fetchPolicy: 'network-only',
    });
    expect(query).toHaveBeenNthCalledWith(2, {
      query: FIND_THREAD_LINKS_QUERY,
      variables: { filter, limit: 30, lastCursor: 'first-links-page' },
      fetchPolicy: 'network-only',
    });
  });

  it('rejects link lookup errors instead of returning a partial set', async () => {
    query.mockRejectedValueOnce(new Error('Link lookup failed'));
    const result = renderChatThreadsForRecord();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).rejects.toThrow('Link lookup failed');
  });

  it('rejects a failed later page instead of detaching only the first links', async () => {
    query
      .mockResolvedValueOnce(
        buildLinksPage({
          linkIds: ['link-1'],
          hasNextPage: true,
          endCursor: 'first-links-page',
        }),
      )
      .mockResolvedValueOnce({ error: new Error('Next page failed') });
    const result = renderChatThreadsForRecord();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).rejects.toThrow('Next page failed');
  });

  it('does not read conversation links without object read permission', async () => {
    useObjectPermissionsForObject.mockReturnValue({
      canReadObjectRecords: false,
    });
    const result = renderChatThreadsForRecord();

    await expect(
      result.current.getAllLinkIdsToThread(RENEWAL_THREAD_ID),
    ).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
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
    expect(query).not.toHaveBeenCalled();
  });

  it('loads the next page of linked conversations', async () => {
    const result = renderChatThreadsForRecord();

    await act(async () => {
      await result.current.fetchMoreThreads();
    });

    expect(fetchMoreRecords).toHaveBeenCalledTimes(1);
    expect(result.current.hasNextPage).toBe(true);
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
    expect(refetch).toHaveBeenCalledWith({
      limit: 20,
      lastCursor: undefined,
    });
  });

  it('keeps every loaded link when refreshing after a mutation or retrying', async () => {
    const loadedLinks = Array.from({ length: 40 }, (_, linkIndex) =>
      buildLink({
        id: `link-${linkIndex}`,
        threadId: RENEWAL_THREAD_ID,
        title: 'Renewal prep',
      }),
    );
    useFindManyRecords.mockReturnValue({
      ...findManyRecordsResult,
      records: loadedLinks,
    });
    const result = renderChatThreadsForRecord();

    dispatchThreadOperation({
      type: 'delete-one',
      deletedRecordId: ONBOARDING_THREAD_ID,
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.threads).toHaveLength(1);
    expect(refetch).toHaveBeenCalledTimes(2);
    expect(refetch).toHaveBeenNthCalledWith(1, {
      limit: loadedLinks.length,
      lastCursor: undefined,
    });
    expect(refetch).toHaveBeenNthCalledWith(2, {
      limit: loadedLinks.length,
      lastCursor: undefined,
    });
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
