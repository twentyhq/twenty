import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { isSucceededAttachConversationToRecordToolPart } from '@/ai/utils/isSucceededAttachConversationToRecordToolPart';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useProcessConversationRecordAttachment = () => {
  const apolloCoreClient = useApolloCoreClient();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  });

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

    if (!isDefined(junctionConfig)) {
      return;
    }

    // The chat tool wrote the link on the server, where no record event
    // reaches this client unless a query listens for it, so the cached lists
    // of links and the cached threads are dropped: mounted queries refetch
    // now and the others on their next mount.
    const { cache } = apolloCoreClient;

    cache.evict({
      id: 'ROOT_QUERY',
      fieldName: junctionConfig.junctionObjectMetadata.namePlural,
    });
    cache.evict({
      id: 'ROOT_QUERY',
      fieldName: CoreObjectNameSingular.AgentChatThread,
    });
  };

  return {
    processConversationRecordAttachment,
  };
};
