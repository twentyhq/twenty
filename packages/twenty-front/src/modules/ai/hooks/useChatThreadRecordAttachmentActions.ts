import { useMutation } from '@apollo/client/react';

import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';
import { refetchActiveFindOneRecordQueries } from '@/ai/utils/refetchActiveFindOneRecordQueries';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useToast } from 'twenty-ui/components';
import {
  AttachChatThreadToRecordDocument,
  DetachChatThreadFromRecordDocument,
  GetChatThreadsForRecordDocument,
} from '~/generated-metadata/graphql';

type ChatThreadRecordAttachment = AgentChatRecordTarget & {
  threadId: string;
};

export const useChatThreadRecordAttachmentActions = () => {
  const { enqueueToast } = useToast();
  const apolloCoreClient = useApolloCoreClient();

  const [attachMutation] = useMutation(AttachChatThreadToRecordDocument, {
    refetchQueries: [GetChatThreadsForRecordDocument],
  });
  const [detachMutation] = useMutation(DetachChatThreadFromRecordDocument, {
    refetchQueries: [GetChatThreadsForRecordDocument],
  });

  // The thread header reads the thread's links from the workspace API.
  const refetchThreadRecordTargets = (threadId: string) =>
    refetchActiveFindOneRecordQueries({
      apolloCoreClient,
      objectNameSingular: AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR,
      recordId: threadId,
    });

  const attachChatThreadToRecord = async (
    variables: ChatThreadRecordAttachment,
  ) => {
    try {
      await attachMutation({ variables });
      await refetchThreadRecordTargets(variables.threadId);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const detachChatThreadFromRecord = async (
    variables: ChatThreadRecordAttachment,
  ) => {
    try {
      await detachMutation({ variables });
      await refetchThreadRecordTargets(variables.threadId);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { attachChatThreadToRecord, detachChatThreadFromRecord };
};
