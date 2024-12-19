import { renderHook, waitFor } from '@testing-library/react';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import gql from 'graphql-tag';
import { generateEmptyJestRecordNode } from '~/testing/jest/generateEmptyJestRecordNode';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useRightDrawerEmailThread } from '../useRightDrawerEmailThread';

const mocks = [
  {
    request: {
      query: gql`
        query FindOneMessageThread($objectRecordId: ID!) {
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
      query: gql`
        query FindManyMessages(
          $filter: MessageFilterInput
          $orderBy: [MessageOrderByInput]
          $lastCursor: String
          $limit: Int
        ) {
          messages(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                __typename
                createdAt
                headerMessageId
                id
                messageParticipants {
                  edges {
                    node {
                      __typename
                      displayName
                      handle
                      id
                      person {
                        __typename
                        avatarUrl
                        city
                        companyId
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                        }
                        deletedAt
                        emails {
                          primaryEmail
                          additionalEmails
                        }
                        id
                        intro
                        jobTitle
                        linkedinLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        name {
                          firstName
                          lastName
                        }
                        performanceRating
                        phones {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        position
                        updatedAt
                        whatsapp {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        workPreference
                        xLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                      }
                      role
                      workspaceMember {
                        __typename
                        avatarUrl
                        colorScheme
                        createdAt
                        dateFormat
                        deletedAt
                        id
                        locale
                        name {
                          firstName
                          lastName
                        }
                        timeFormat
                        timeZone
                        updatedAt
                        userEmail
                        userId
                      }
                    }
                  }
                }
                messageThread {
                  __typename
                  id
                }
                receivedAt
                subject
                text
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: { messageThreadId: { eq: '1' } },
        orderBy: [{ receivedAt: 'AscNullsLast' }],
        lastCursor: undefined,
        limit: 10,
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
      query: gql`
        query FindManyMessageParticipants(
          $filter: MessageParticipantFilterInput
          $orderBy: [MessageParticipantOrderByInput]
          $lastCursor: String
          $limit: Int
        ) {
          messageParticipants(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                __typename
                displayName
                handle
                id
                messageId
                person {
                  __typename
                  avatarUrl
                  city
                  companyId
                  createdAt
                  createdBy {
                    source
                    workspaceMemberId
                    name
                  }
                  deletedAt
                  emails {
                    primaryEmail
                    additionalEmails
                  }
                  id
                  intro
                  jobTitle
                  linkedinLink {
                    primaryLinkUrl
                    primaryLinkLabel
                    secondaryLinks
                  }
                  name {
                    firstName
                    lastName
                  }
                  performanceRating
                  phones {
                    primaryPhoneNumber
                    primaryPhoneCountryCode
                    primaryPhoneCallingCode
                    additionalPhones
                  }
                  position
                  updatedAt
                  whatsapp {
                    primaryPhoneNumber
                    primaryPhoneCountryCode
                    primaryPhoneCallingCode
                    additionalPhones
                  }
                  workPreference
                  xLink {
                    primaryLinkUrl
                    primaryLinkLabel
                    secondaryLinks
                  }
                }
                role
                workspaceMember {
                  __typename
                  avatarUrl
                  colorScheme
                  createdAt
                  dateFormat
                  deletedAt
                  id
                  locale
                  name {
                    firstName
                    lastName
                  }
                  timeFormat
                  timeZone
                  updatedAt
                  userEmail
                  userId
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: { messageId: { in: ['1', '2'] }, role: { eq: 'from' } },
        orderBy: undefined,
        lastCursor: undefined,
        limit: undefined,
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
                  role: 'from',
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
                  role: 'from',
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

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
  onInitializeRecoilSnapshot: ({ set }) => {
    set(viewableRecordIdState, '1');
  },
});

describe('useRightDrawerEmailThread', () => {
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
          role: 'from',
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
          role: 'from',
          workspaceMember: null,
        },
        subject: '',
        text: 'Message 2',
      },
    ];

    const { result } = renderHook(() => useRightDrawerEmailThread(), {
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
