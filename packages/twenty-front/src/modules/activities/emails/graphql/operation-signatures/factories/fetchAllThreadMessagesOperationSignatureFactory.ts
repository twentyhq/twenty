import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

export const fetchAllThreadMessagesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({ messageThreadId }: { messageThreadId: string }) => ({
    objectNameSingular: CoreObjectNameSingular.Message,
    variables: {
      filter: {
        messageThreadId: {
          eq: messageThreadId || '',
        },
      },
      orderBy: [
        {
          receivedAt: 'AscNullsLast',
        },
      ],
      limit: QUERY_MAX_RECORDS,
    },
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      headerMessageId: true,
      subject: true,
      text: true,
      receivedAt: true,
      messageThread: {
        id: true,
      },
      messageParticipants: {
        id: true,
        role: true,
        displayName: true,
        handle: true,
        person: true,
        workspaceMember: true,
      },
    },
  });
