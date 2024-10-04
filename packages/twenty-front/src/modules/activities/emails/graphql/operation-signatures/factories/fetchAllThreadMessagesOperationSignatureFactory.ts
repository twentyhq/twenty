import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const fetchAllThreadMessagesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({
    messageThreadId,
    isSubscribersEnabled,
  }: {
    messageThreadId: string;
    isSubscribersEnabled: boolean;
  }) => ({
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
      limit: 10,
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
        subscribers: isSubscribersEnabled
          ? {
              workspaceMember: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            }
          : undefined,
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
