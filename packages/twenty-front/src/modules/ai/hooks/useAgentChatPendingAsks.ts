import { useCallback, useMemo } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatPendingAsk } from '@/ai/types/AgentChatPendingAsk';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { parseInputAskForm } from '@/input-ask/utils/parseInputAskForm';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

const ORDER_BY_CREATION: RecordGqlOperationOrderBy = [
  { createdAt: 'AscNullsLast' },
];

type PendingInputAskRecord = ObjectRecord & {
  toolCallId: string | null;
  form: unknown;
};

// The Asks are the record of what the conversation waits on, so the cards
// are read from them rather than from the last message, and follow them live.
// A step that paused on several calls waits on one Ask each, oldest first.
export const useAgentChatPendingAsks = ({
  threadId,
}: {
  threadId: string;
}): AgentChatPendingAsk[] => {
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
    orderBy: ORDER_BY_CREATION,
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

  return useMemo(
    () =>
      records.flatMap((record) => {
        const form = parseInputAskForm(record.form);

        return isDefined(record.toolCallId) && isDefined(form)
          ? [{ id: record.id, toolCallId: record.toolCallId, form }]
          : [];
      }),
    [records],
  );
};
