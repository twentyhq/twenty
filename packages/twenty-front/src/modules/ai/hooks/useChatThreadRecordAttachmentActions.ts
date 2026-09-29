import { useMutation } from '@apollo/client/react';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useToast } from 'twenty-ui/components';
import {
  AttachChatThreadToRecordDocument,
  DetachChatThreadFromRecordDocument,
  GetChatThreadsForRecordDocument,
} from '~/generated-metadata/graphql';

export const useChatThreadRecordAttachmentActions = ({
  id: recordId,
  targetObjectNameSingular: objectNameSingular,
}: TargetRecordIdentifier) => {
  const { enqueueToast } = useToast();

  const [attachMutation] = useMutation(AttachChatThreadToRecordDocument, {
    refetchQueries: [GetChatThreadsForRecordDocument],
  });
  const [detachMutation] = useMutation(DetachChatThreadFromRecordDocument, {
    refetchQueries: [GetChatThreadsForRecordDocument],
  });

  const attachChatThreadToRecord = async (threadId: string) => {
    try {
      await attachMutation({
        variables: { threadId, objectNameSingular, recordId },
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const detachChatThreadFromRecord = async (threadId: string) => {
    try {
      await detachMutation({
        variables: { threadId, objectNameSingular, recordId },
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { attachChatThreadToRecord, detachChatThreadFromRecord };
};
