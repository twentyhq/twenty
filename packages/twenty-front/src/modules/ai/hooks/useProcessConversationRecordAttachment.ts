import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_PLURAL } from '@/ai/constants/AgentChatThreadTargetObjectNamePlural';
import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { isSucceededAttachConversationToRecordToolPart } from '@/ai/utils/isSucceededAttachConversationToRecordToolPart';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { capitalize } from 'twenty-shared/utils';

export const useProcessConversationRecordAttachment = () => {
  const apolloCoreClient = useApolloCoreClient();

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

    // The server wrote the link, which this client's cache cannot know about,
    // so the record page's conversations and the chat header's linked records
    // are refetched. A failed refetch surfaces in their own error states.
    apolloCoreClient
      .refetchQueries({
        include: [
          `FindMany${capitalize(AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_PLURAL)}`,
          `FindOne${capitalize(AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR)}`,
        ],
      })
      .catch(() => undefined);
  };

  return {
    processConversationRecordAttachment,
  };
};
