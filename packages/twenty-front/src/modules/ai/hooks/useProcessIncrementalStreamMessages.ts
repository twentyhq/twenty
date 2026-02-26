import { useProcessUnprocessedMessageStreamIncrement } from '@/ai/hooks/useProcessUnprocessedMessageStreamIncrement';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { cloneDeep } from '@apollo/client/utilities';
import { atom, useStore } from 'jotai';
import { useCallback } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useProcessIncrementalStreamMessages = () => {
  const store = useStore();

  const agentChatMessagesCallbackState = useAtomComponentStateCallbackState(
    agentChatMessagesComponentState,
  );

  const agentChatMessageFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      agentChatMessageComponentFamilyState,
    );

  const { processUnprocessedMessageStreamIncrement } =
    useProcessUnprocessedMessageStreamIncrement();

  const processIncrementalStreamMessages = useCallback(
    (incrementalStreamMessages: ExtendedUIMessage[]) => {
      let updatedMessagesToProcess: ExtendedUIMessage[] = [];

      store.set(
        atom(null, (get, batchSet) => {
          const existingAgentChatMessages = get(agentChatMessagesCallbackState);

          for (const updatedMessage of incrementalStreamMessages) {
            const alreadyExistingMessage = existingAgentChatMessages.find(
              (existingMessage) => existingMessage.id === updatedMessage.id,
            );

            if (isDefined(alreadyExistingMessage)) {
              if (!isDeeplyEqual(alreadyExistingMessage, updatedMessage)) {
                const clonedMessage = cloneDeep(updatedMessage);

                batchSet(agentChatMessagesCallbackState, [
                  ...existingAgentChatMessages.filter(
                    (msg) => msg.id !== updatedMessage.id,
                  ),
                  clonedMessage,
                ]);

                batchSet(
                  agentChatMessageFamilyCallbackState(updatedMessage.id),
                  clonedMessage,
                );

                processUnprocessedMessageStreamIncrement(updatedMessage);
              }
            } else {
              const clonedMessage = cloneDeep(updatedMessage);

              batchSet(agentChatMessagesCallbackState, [
                ...existingAgentChatMessages,
                clonedMessage,
              ]);

              batchSet(
                agentChatMessageFamilyCallbackState(updatedMessage.id),
                clonedMessage,
              );

              processUnprocessedMessageStreamIncrement(updatedMessage);
            }
          }
        }),
      );

      return { updatedMessagesToProcess };
    },
    [
      agentChatMessagesCallbackState,
      agentChatMessageFamilyCallbackState,
      store,
      processUnprocessedMessageStreamIncrement,
    ],
  );

  return {
    processIncrementalStreamMessages,
  };
};
