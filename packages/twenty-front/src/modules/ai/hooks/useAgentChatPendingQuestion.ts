import { useCallback, useMemo } from 'react';
import { type AskQuestionItem } from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

type PendingInputAskRecord = ObjectRecord & {
  toolCallId: string | null;
  form: unknown;
};

const getAskedQuestions = (form: unknown): AskQuestionItem[] | null =>
  isPlainObject(form) &&
  Array.isArray(form.questions) &&
  isNonEmptyArray(form.questions)
    ? (form.questions as AskQuestionItem[])
    : null;

// The Ask is the record of what the conversation waits on, so the card is
// read from it rather than from the last message, and follows it live.
export const useAgentChatPendingQuestion = ({
  threadId,
}: {
  threadId: string;
}): AgentChatPendingQuestion | null => {
  const { objectMetadataItem: inputAskObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.InputAsk,
    });

  const filter = useMemo(
    () => ({
      threadId: { eq: threadId },
      status: { in: ['PENDING'] },
    }),
    [threadId],
  );

  const { records, refetch } = useFindManyRecords<PendingInputAskRecord>({
    objectNameSingular: CoreObjectNameSingular.InputAsk,
    filter,
    recordGqlFields: { id: true, toolCallId: true, form: true },
    fetchPolicy: 'network-only',
  });

  const refetchPendingInputAsks = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.InputAsk,
      variables: { filter },
    }),
    [filter],
  );

  useListenToEventsForQuery({
    queryId: `agent-chat-pending-input-ask-${threadId}`,
    operationSignature,
    onSseReconnected: refetchPendingInputAsks,
  });

  const handleInputAskOperation = useCallback(() => {
    void refetchPendingInputAsks();
  }, [refetchPendingInputAsks]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleInputAskOperation,
    objectMetadataItemId: inputAskObjectMetadataItem.id,
  });

  return useMemo(() => {
    for (const record of records) {
      const questions = getAskedQuestions(record.form);

      if (isDefined(record.toolCallId) && isDefined(questions)) {
        return { toolCallId: record.toolCallId, questions };
      }
    }

    return null;
  }, [records]);
};
