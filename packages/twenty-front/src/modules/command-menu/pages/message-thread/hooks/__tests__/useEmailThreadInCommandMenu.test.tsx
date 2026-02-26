import { renderHook, waitFor } from '@testing-library/react';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { useEmailThreadInCommandMenu } from '@/command-menu/pages/message-thread/hooks/useEmailThreadInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import gql from 'graphql-tag';
import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';
import { generateEmptyJestRecordNode } from '~/testing/jest/generateEmptyJestRecordNode';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const messageMetadataItem = getMockObjectMetadataItemOrThrow('message');
const messageParticipantMetadataItem =
  getMockObjectMetadataItemOrThrow('messageParticipant');

const messageOperationSignature =
  fetchAllThreadMessagesOperationSignatureFactory({
    messageThreadId: '1',
  });

const findManyMessagesQuery = generateFindManyRecordsQuery({
  objectMetadataItem: messageMetadataItem,
  objectMetadataItems: generatedMockObjectMetadataItems,
  recordGqlFields: messageOperationSignature.fields,
  objectPermissionsByObjectMetadataId: {},
});

const findManyMessageParticipantsQuery = generateFindManyRecordsQuery({
  objectMetadataItem: messageParticipantMetadataItem,
  objectMetadataItems: generatedMockObjectMetadataItems,
  recordGqlFields: {
    id: true,
    role: true,
    displayName: true,
    messageId: true,
    handle: true,
    person: true,
    workspaceMember: true,
  },
  objectPermissionsByObjectMetadataId: {},
});

const mocks = [
  {
    request: {
      query: gql`
        query FindOneMessageThread($objectRecordId: UUID!) {
          messageThread(filter: { id: { eq: $objectRecordId } }) {
            __typename
            id
          }
        }
      `,
      variables: { objectRecordId: '1' },
    },
    result: jest.fn(() => ({
      data: {
        messageThread: {
          id: '1',
          __typename: 'MessageThread',
        },
      },
    })),
  },
  {
    request: {
      query: findManyMessagesQuery,
      variables: {
        filter: { messageThreadId: { eq: '1' } },
        orderBy: [{ receivedAt: 'AscNullsLast' }],
        lastCursor: undefined,
        limit: QUERY_MAX_RECORDS,
      },
    },
    result: jest.fn(() => ({
      data: {
        messages: {
          edges: [
            {
              node: generateEmptyJestRecordNode({
                objectNameSingular: 'message',
                input: {
                  id: '1',
                  text: 'Message 1',
                  createdAt: '2024-10-03T10:20:10.145Z',
                },
              }),
              cursor: '1',
            },
            {
              node: generateEmptyJestRecordNode({
                objectNameSingular: 'message',
                input: {
                  id: '2',
                  text: 'Message 2',
                  createdAt: '2024-10-03T10:20:10.145Z',
                },
              }),
              cursor: '2',
            },
          ],
          totalCount: 2,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '1',
            endCursor: '2',
          },
        },
      },
    })),
  },
  {
    request: {
      query: findManyMessageParticipantsQuery,
      variables: {
        filter: {
          messageId: { in: ['1', '2'] },
          role: { eq: MessageParticipantRole.FROM },
        },
        orderBy: undefined,
        lastCursor: undefined,
        limit: QUERY_DEFAULT_LIMIT_RECORDS,
      },
    },
    result: jest.fn(() => ({
      data: {
        messageParticipants: {
          edges: [
            {
              node: generateEmptyJestRecordNode({
                objectNameSingular: 'messageParticipant',
                input: {
                  id: 'messageParticipant-1',
                  role: MessageParticipantRole.FROM,
                  messageId: '1',
                },
              }),
              cursor: '1',
            },
            {
              node: generateEmptyJestRecordNode({
                objectNameSingular: 'messageParticipant',
                input: {
                  id: 'messageParticipant-2',
                  role: MessageParticipantRole.FROM,
                  messageId: '2',
                },
              }),
              cursor: '2',
            },
          ],
          totalCount: 2,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '1',
            endCursor: '2',
          },
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: mocks,
    onInitializeJotaiStore: (store) => {
      store.set(
        viewableRecordIdComponentState.atomFamily({
          instanceId: 'test-instance',
        }),
        '1',
      );
    },
  });

  return (
    <MetadataWrapper>
      <CommandMenuPageComponentInstanceContext.Provider
        value={{ instanceId: 'test-instance' }}
      >
        {children}
      </CommandMenuPageComponentInstanceContext.Provider>
    </MetadataWrapper>
  );
};

describe('useEmailThreadInCommandMenu', () => {
  it('should return correct values', async () => {
    const mockMessages = [
      {
        __typename: 'Message',
        createdAt: '2024-10-03T10:20:10.145Z',
        headerMessageId: '',
        id: '1',
        messageParticipants: [],
        messageThread: null,
        receivedAt: null,
        sender: {
          __typename: 'MessageParticipant',
          displayName: '',
          handle: '',
          id: 'messageParticipant-1',
          messageId: '1',
          person: null,
          role: MessageParticipantRole.FROM,
          workspaceMember: null,
        },
        subject: '',
        text: 'Message 1',
      },
      {
        __typename: 'Message',
        createdAt: '2024-10-03T10:20:10.145Z',
        headerMessageId: '',
        id: '2',
        messageParticipants: [],
        messageThread: null,
        receivedAt: null,
        sender: {
          __typename: 'MessageParticipant',
          displayName: '',
          handle: '',
          id: 'messageParticipant-2',
          messageId: '2',
          person: null,
          role: MessageParticipantRole.FROM,
          workspaceMember: null,
        },
        subject: '',
        text: 'Message 2',
      },
    ];

    const { result } = renderHook(() => useEmailThreadInCommandMenu(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.thread).toBeDefined();
      expect(result.current.messages).toEqual(mockMessages);
      expect(result.current.threadLoading).toBeFalsy();
      expect(result.current.fetchMoreMessages).toBeInstanceOf(Function);
    });
  });
});
