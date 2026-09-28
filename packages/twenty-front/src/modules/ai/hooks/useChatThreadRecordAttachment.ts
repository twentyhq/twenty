import { useMutation } from '@apollo/client/react';

import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { ATTACH_CHAT_THREAD_TO_RECORD } from '@/ai/graphql/mutations/attachChatThreadToRecord';
import { DETACH_CHAT_THREAD_FROM_RECORD } from '@/ai/graphql/mutations/detachChatThreadFromRecord';
import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';
import { refetchActiveFindOneRecordQueries } from '@/ai/utils/refetchActiveFindOneRecordQueries';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useToast } from 'twenty-ui/components';
import {
  type MutationAttachChatThreadToRecordArgs,
  type MutationDetachChatThreadFromRecordArgs,
} from '~/generated-metadata/graphql';

type ChatThreadRecordAttachmentArgs = AgentChatRecordTarget & {
  threadId: string;
};

export const useChatThreadRecordAttachment = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { enqueueToast } = useToast();

  const [attachChatThreadToRecordMutation] = useMutation<
    { attachChatThreadToRecord: boolean },
    MutationAttachChatThreadToRecordArgs
  >(ATTACH_CHAT_THREAD_TO_RECORD);

  const [detachChatThreadFromRecordMutation] = useMutation<
    { detachChatThreadFromRecord: boolean },
    MutationDetachChatThreadFromRecordArgs
  >(DETACH_CHAT_THREAD_FROM_RECORD);

  const refetchLinkedRecords = ({
    threadId,
    objectNameSingular,
    recordId,
  }: ChatThreadRecordAttachmentArgs) =>
    refetchActiveFindOneRecordQueries({
      apolloCoreClient,
      records: [
        {
          objectNameSingular: AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR,
          recordId: threadId,
        },
        { objectNameSingular, recordId },
      ],
    });

  const attachChatThreadToRecord = async (
    args: ChatThreadRecordAttachmentArgs,
  ): Promise<boolean> => {
    try {
      await attachChatThreadToRecordMutation({ variables: args });
      await refetchLinkedRecords(args);

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  const detachChatThreadFromRecord = async (
    args: ChatThreadRecordAttachmentArgs,
  ): Promise<boolean> => {
    try {
      await detachChatThreadFromRecordMutation({ variables: args });
      await refetchLinkedRecords(args);

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { attachChatThreadToRecord, detachChatThreadFromRecord };
};
