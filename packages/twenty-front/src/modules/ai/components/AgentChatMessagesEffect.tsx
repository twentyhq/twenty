import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { cloneDeep } from '@apollo/client/utilities';
import { atom, useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  type ExtendedUIMessage,
  type NavigateAppToolOutput,
} from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const AgentChatComponentInstanceContext =
  createComponentInstanceContext();

export const agentChatMessagesComponentState = createAtomComponentState<
  ExtendedUIMessage[]
>({
  key: 'agentChatMessagesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatComponentInstanceContext,
});

export const useProcessAgentMessage = () => {
  const navigateApp = useNavigateApp();

  const { objectMetadataItems } = useObjectMetadataItems();

  const processAgentMessage = (agentMessage: ExtendedUIMessage) => {
    const executionMessageParts = agentMessage.parts.filter(
      (part) =>
        part.type === 'tool-execute_tool' && part.state === 'output-available',
    );

    // TODO: detect if messages are incoming or just loaded from chat history.
    if (executionMessageParts.length > 0) {
      for (const executionPart of executionMessageParts) {
        if (executionPart.output?.toolName === 'navigate_app') {
          const navigateAppOutput = executionPart.output?.result
            .result as NavigateAppToolOutput;

          switch (navigateAppOutput.action) {
            case 'navigateToDefaultViewForObject': {
              const objectNamePlural =
                objectMetadataItems.find(
                  (item) =>
                    item.nameSingular === navigateAppOutput.objectNameSingular,
                )?.namePlural ?? 'companies';

              navigateApp(AppPath.RecordIndexPage, {
                objectNamePlural: objectNamePlural,
              });

              break;
            }
            case 'navigateToIndexPageView':
              // TODO: implement
              break;
            default:
              break;
          }
        }
      }
    }
  };

  return {
    processAgentMessage,
  };
};

const useGetUpdatedAgentMessages = () => {
  const store = useStore();

  const agentChatMessagesCallbackState = useAtomComponentStateCallbackState(
    agentChatMessagesComponentState,
  );

  const getUpdatedAgentMessages = useCallback(
    (updatedMessages: ExtendedUIMessage[]) => {
      let updatedMessagesToProcess: ExtendedUIMessage[] = [];

      // console.log(JSON.stringify(updatedMessages, null, 2));

      store.set(
        atom(null, (get, batchSet) => {
          const existingAgentChatMessages = get(agentChatMessagesCallbackState);

          for (const updatedMessage of updatedMessages) {
            const alreadyExistingMessage = existingAgentChatMessages.find(
              (existingMessage) => existingMessage.id === updatedMessage.id,
            );

            if (isDefined(alreadyExistingMessage)) {
              if (!isDeeplyEqual(alreadyExistingMessage, updatedMessage)) {
                batchSet(agentChatMessagesCallbackState, [
                  ...existingAgentChatMessages.filter(
                    (msg) => msg.id !== updatedMessage.id,
                  ),
                  cloneDeep(updatedMessage),
                ]);

                updatedMessagesToProcess.push(updatedMessage);
              }
            } else {
              batchSet(agentChatMessagesCallbackState, [
                ...existingAgentChatMessages,
                cloneDeep(updatedMessage),
              ]);

              updatedMessagesToProcess.push(updatedMessage);
            }
          }
        }),
      );

      return { updatedMessagesToProcess };
    },
    [agentChatMessagesCallbackState, store],
  );

  return {
    getUpdatedAgentMessages,
  };
};

export const AgentChatMessagesEffect = ({
  messages,
}: {
  messages: ExtendedUIMessage[];
}) => {
  const { scrollToBottom, isNearBottom } = useAgentChatScrollToBottom();

  const { processAgentMessage } = useProcessAgentMessage();

  const { getUpdatedAgentMessages } = useGetUpdatedAgentMessages();

  useEffect(() => {
    const { updatedMessagesToProcess } = getUpdatedAgentMessages(messages);

    if (updatedMessagesToProcess.length === 0) {
      return;
    }

    if (isNearBottom) {
      scrollToBottom();
    }

    for (const updatedMessage of updatedMessagesToProcess) {
      processAgentMessage(updatedMessage);
    }
  }, [
    messages,
    scrollToBottom,
    isNearBottom,
    getUpdatedAgentMessages,
    processAgentMessage,
  ]);

  return null;
};
