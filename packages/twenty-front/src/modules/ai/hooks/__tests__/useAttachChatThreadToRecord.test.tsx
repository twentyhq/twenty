import { act, renderHook } from '@testing-library/react';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const COMPANY_ID = '20202020-0000-4000-8000-000000000002';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
// A custom object on the same leg, to cover the legs without a unique index.
const customCompanyObjectMetadataItem = {
  ...companyObjectMetadataItem,
  nameSingular: 'customCompany',
  isCustom: true,
};
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
const refetchQueries = jest.fn();
const createManyRecords = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query, refetchQueries }),
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
    objectMetadataItems: [
      companyObjectMetadataItem,
      customCompanyObjectMetadataItem,
      personObjectMetadataItem,
    ],
  }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig',
  () => ({
    useObjectMorphJunctionConfig: () => ({
      junctionObjectMetadata: {
        nameSingular: 'agentChatThreadTarget',
        namePlural: 'agentChatThreadTargets',
      },
      sourceJoinColumnName: 'threadId',
      targetFields: [companyTargetField],
    }),
  }),
);

const attachTo = async (objectNameSingular = 'company') => {
  const { result } = renderHook(() => useAttachChatThreadToRecord());

  await act(async () => {
    await result.current.attachChatThreadToRecord({
      threadId: THREAD_ID,
      objectNameSingular,
      recordId: COMPANY_ID,
    });
  });
};

describe('useAttachChatThreadToRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    query.mockResolvedValue(buildExistingLinks([]));
    createManyRecords.mockResolvedValue([]);
    refetchQueries.mockResolvedValue([]);
  });

  // The standard leg's unique index lets the upsert absorb a link the chat
  // tool wrote during the same turn.
  it('links the conversation to a standard record without looking first', async () => {
    await attachTo();

    expect(query).not.toHaveBeenCalled();
    expect(createManyRecords).toHaveBeenCalledWith({
      recordsToCreate: [{ threadId: THREAD_ID, companyId: COMPANY_ID }],
      upsert: true,
    });
  });

  it('links the conversation to a custom record it is not linked to yet', async () => {
    await attachTo('customCompany');

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
    expect(createManyRecords).toHaveBeenCalledTimes(1);
  });

  it('does not link a custom record twice', async () => {
    query.mockResolvedValue(buildExistingLinks(['link-by-the-chat-tool']));

    await attachTo('customCompany');

    expect(createManyRecords).not.toHaveBeenCalled();
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('tells the member when the link cannot be made', async () => {
    createManyRecords.mockRejectedValue(new Error('Network error'));

    await attachTo();

    expect(enqueueToast).toHaveBeenCalledTimes(1);
  });

  it('does not report a failure when only the refresh of the counts fails', async () => {
    refetchQueries.mockRejectedValue(new Error('Network error'));

    await attachTo();

    expect(createManyRecords).toHaveBeenCalledTimes(1);
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('does not link a record whose object conversations cannot be attached to', async () => {
    await attachTo('person');

    expect(query).not.toHaveBeenCalled();
    expect(createManyRecords).not.toHaveBeenCalled();
  });
});
