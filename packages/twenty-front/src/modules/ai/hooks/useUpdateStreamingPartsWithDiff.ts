import { useProcessStreamingMessageUpdate } from '@/ai/hooks/useProcessStreamingMessageUpdate';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { cloneDeep } from '@apollo/client/utilities';
import { useCallback } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpdateStreamingPartsWithDiff = () => {
  const agentChatMessageFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      agentChatMessageComponentFamilyState,
    );

  const { processStreamingMessageUpdate } = useProcessStreamingMessageUpdate();

  const updateStreamingPartsWithDiff = useCallback(
    (incomingMessages: ExtendedUIMessage[]) => {
      for (const incomingMessage of incomingMessages) {
        const alreadyExistingMessage = jotaiStore.get(
          agentChatMessageFamilyCallbackState(incomingMessage.id),
        );

        const messageContentHasChanged = !isDeeplyEqual(
          alreadyExistingMessage,
          incomingMessage,
        );

        const messageAlreadyExists = isDefined(alreadyExistingMessage);

        const shouldProcessMessage =
          !messageAlreadyExists || messageContentHasChanged;

        if (!shouldProcessMessage) {
          continue;
        }

        const clonedMessage = cloneDeep(incomingMessage);

        jotaiStore.set(
          agentChatMessageFamilyCallbackState(incomingMessage.id),
          clonedMessage,
        );

        processStreamingMessageUpdate(incomingMessage);
      }
    },
    [agentChatMessageFamilyCallbackState, processStreamingMessageUpdate],
  );

  return {
    updateStreamingPartsWithDiff,
  };
};
