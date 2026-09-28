import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { isSucceededAttachConversationToRecordToolPart } from '@/ai/utils/isSucceededAttachConversationToRecordToolPart';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useApolloClient } from '@apollo/client/react';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { GetChatThreadsForRecordDocument } from '~/generated-metadata/graphql';

export const useProcessConversationRecordAttachment = () => {
  const apolloClient = useApolloClient();

  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const processConversationRecordAttachment = (
    message: Pick<ExtendedUIMessage, 'parts'>,
  ) => {
    const alreadyProcessedToolExecutionPartIds = store.get(
      processedToolExecutionPartIdsCallbackState,
    );

    const toolCallIdsToProcess = message.parts
      .filter(isSucceededAttachConversationToRecordToolPart)
      .map((part) => part.toolCallId)
      .filter(
        (toolCallId) =>
          !alreadyProcessedToolExecutionPartIds.includes(toolCallId),
      );

    if (!isNonEmptyArray(toolCallIdsToProcess)) {
      return;
    }

    store.set(processedToolExecutionPartIdsCallbackState, [
      ...alreadyProcessedToolExecutionPartIds,
      ...toolCallIdsToProcess,
    ]);

    // The link is written without record events, so a record page already
    // showing its conversations would not hear about it. A failed refetch
    // surfaces in that widget's own error state.
    apolloClient
      .refetchQueries({ include: [GetChatThreadsForRecordDocument] })
      .catch(() => undefined);
  };

  return {
    processConversationRecordAttachment,
  };
};
