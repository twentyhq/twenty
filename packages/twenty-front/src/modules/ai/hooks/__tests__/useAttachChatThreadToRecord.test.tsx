import { act, renderHook } from '@testing-library/react';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const COMPANY_ID = '20202020-0000-4000-8000-000000000002';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
// Any relation to company stands in for the thread target's company leg.
const companyTargetField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'company',
});

const buildExistingLinks = (linkIds: string[]) => ({
  data: {
    agentChatThreadTargets: {
      edges: linkIds.map((id) => ({ node: { id } })),
    },
  },
});

const query = jest.fn();
const createManyRecords = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query }),
}));

jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: {} }),
}));

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({ createManyRecords }),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [companyObjectMetadataItem, personObjectMetadataItem],
  }),
}));

jest.mock('@/ai/hooks/useAgentChatThreadJunctionConfig', () => ({
  useAgentChatThreadJunctionConfig: () => ({
    junctionObjectMetadata: {
      nameSingular: 'agentChatThreadTarget',
      namePlural: 'agentChatThreadTargets',
    },
    sourceJoinColumnName: 'threadId',
    targetFields: [companyTargetField],
  }),
}));

const attachToCompany = async (objectNameSingular = 'company') => {
  const { result } = renderHook(() => useAttachChatThreadToRecord());
  let isAttached: boolean | undefined;

  await act(async () => {
    isAttached = await result.current.attachChatThreadToRecord({
      threadId: THREAD_ID,
      objectNameSingular,
      recordId: COMPANY_ID,
    });
  });

  return isAttached;
};

describe('useAttachChatThreadToRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    query.mockResolvedValue(buildExistingLinks([]));
    createManyRecords.mockResolvedValue([]);
  });

  it('links the conversation to the record on its leg', async () => {
    expect(await attachToCompany()).toBe(true);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          filter: {
            threadId: { eq: THREAD_ID },
            companyId: { eq: COMPANY_ID },
          },
          limit: 1,
        },
        fetchPolicy: 'network-only',
      }),
    );
    expect(createManyRecords).toHaveBeenCalledWith({
      recordsToCreate: [{ threadId: THREAD_ID, companyId: COMPANY_ID }],
      upsert: true,
    });
  });

  // The chat model may have linked the same record through its own tool.
  it('succeeds without a second link when the conversation is already linked', async () => {
    query.mockResolvedValue(buildExistingLinks(['link-by-the-chat-tool']));

    expect(await attachToCompany()).toBe(true);

    expect(createManyRecords).not.toHaveBeenCalled();
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('reports a failed link and lets the caller retry', async () => {
    createManyRecords.mockRejectedValue(new Error('Network error'));

    expect(await attachToCompany()).toBe(false);

    expect(enqueueToast).toHaveBeenCalledTimes(1);
  });

  it('does not link a record whose object conversations cannot be attached to', async () => {
    expect(await attachToCompany('person')).toBe(false);

    expect(query).not.toHaveBeenCalled();
    expect(createManyRecords).not.toHaveBeenCalled();
  });
});
