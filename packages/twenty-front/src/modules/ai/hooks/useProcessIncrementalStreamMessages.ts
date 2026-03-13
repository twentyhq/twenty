import { useProcessNewMessageStreamIncrement } from '@/ai/hooks/useProcessNewMessageStreamIncrement';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useProcessIncrementalStreamMessages = () => {
  const agentChatMessageFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      agentChatMessageComponentFamilyState,
    );

  const { processNewMessageStreamIncrement } =
    useProcessNewMessageStreamIncrement();

  const processIncrementalStreamMessages = useCallback(
    (incrementalStreamMessages: ExtendedUIMessage[]) => {
      for (const updatedMessage of incrementalStreamMessages) {
        const alreadyExistingMessage = jotaiStore.get(
          agentChatMessageFamilyCallbackState(updatedMessage.id),
        );

        const messageContentHasChanged = !isDeeplyEqual(
          alreadyExistingMessage,
          updatedMessage,
        );

        const messageAlreadyExists = isDefined(alreadyExistingMessage);

        const shouldProcessMessage =
          !messageAlreadyExists || messageContentHasChanged;

        if (!shouldProcessMessage) {
          continue;
        }

        const clonedMessage = structuredClone(updatedMessage);

        jotaiStore.set(
          agentChatMessageFamilyCallbackState(updatedMessage.id),
          clonedMessage,
        );

        processNewMessageStreamIncrement(updatedMessage);
      }
    },
    [agentChatMessageFamilyCallbackState, processNewMessageStreamIncrement],
  );

  return {
    processIncrementalStreamMessages,
  };
};
