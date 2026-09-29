import { act, renderHook } from '@testing-library/react';

import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
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
    archivedAt: null,
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
const useFindManyRecords = jest.fn((_params: unknown) => ({
  records: LINKS,
  loading: false,
  error: undefined,
  refetch,
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (params: unknown) => useFindManyRecords(params),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      companyObjectMetadataItem,
      personObjectMetadataItem,
      opportunityObjectMetadataItem,
    ],
  }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => ({
      targetFields: [companyTargetField],
    }),
  }),
);

const renderChatThreadsForRecord = (targetObjectNameSingular = 'company') =>
  renderHook(() =>
    useChatThreadsForRecord({ id: COMPANY_ID, targetObjectNameSingular }),
  ).result;

const dispatchThreadOperation = (
  operation: Parameters<
    typeof dispatchMetadataOperationBrowserEvent
  >[0]['operation'],
) =>
  act(() => {
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'agentChatThread',
      operation,
    });
  });

describe('useChatThreadsForRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads the links on the leg of the record's object, most recent conversation first", () => {
    renderChatThreadsForRecord();

    expect(useFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'agentChatThreadTarget',
        skip: false,
        filter: { companyId: { eq: COMPANY_ID } },
        orderBy: [{ thread: { updatedAt: 'DescNullsLast' } }],
      }),
    );
  });

  it('lists each conversation once and detaches all of its links', () => {
    const result = renderChatThreadsForRecord();

    expect(result.current.threads.map(({ title }) => title)).toEqual([
      'Renewal prep',
      'Onboarding',
    ]);
    expect(result.current.getLinkIdsToThread(RENEWAL_THREAD_ID)).toEqual([
      'link-1',
      'link-3',
    ]);
  });

  it('reads nothing for an object conversations cannot be attached to', () => {
    renderChatThreadsForRecord('opportunity');

    expect(useFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true, filter: undefined }),
    );
  });

  it('refreshes when a listed conversation is renamed or deleted in the chat', () => {
    renderChatThreadsForRecord();

    dispatchThreadOperation({
      type: 'update',
      updatedRecord: { id: RENEWAL_THREAD_ID, title: 'Renewal call' },
    });
    dispatchThreadOperation({
      type: 'delete',
      deletedRecordId: ONBOARDING_THREAD_ID,
    });

    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it('ignores conversations that are not linked to the record', () => {
    renderChatThreadsForRecord();

    dispatchThreadOperation({
      type: 'update',
      updatedRecord: { id: '20202020-0000-4000-8000-0000000000cc' },
    });

    expect(refetch).not.toHaveBeenCalled();
  });
});
