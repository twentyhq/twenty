import { StandardObjectNameSingular } from 'twenty-shared/types';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

type FetchAllThreadMessagesOperationSignatureFactory = {
  messageThreadId: string | null;
  isMessageAttachmentEnabled: boolean;
};

export const fetchAllThreadMessagesOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FetchAllThreadMessagesOperationSignatureFactory
> = ({
  messageThreadId,
  isMessageAttachmentEnabled,
}: FetchAllThreadMessagesOperationSignatureFactory) => ({
  objectNameSingular: StandardObjectNameSingular.Message,
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
    isDraft: true,
    // message.attachments only exists once the workspace upgrade has run
    ...(isMessageAttachmentEnabled && {
      attachments: {
        id: true,
        file: true,
      },
    }),
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
    messageChannelMessageAssociations: {
      id: true,
      messageChannelId: true,
      direction: true,
    },
  },
});
