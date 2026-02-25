import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { cloneDeep, type Prettify } from '@apollo/client/utilities';
import { type ToolUIPart } from 'ai';
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

export const processedNavigationMessageIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'processedNavigationMessageIdsComponentState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });

export const useProcessAgentMessage = () => {
  const navigateApp = useNavigateApp();

  const { objectMetadataItems } = useObjectMetadataItems();

  const processedNavigationMessageIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedNavigationMessageIdsComponentState,
    );

  const store = useStore();

  const processAgentMessage = (agentMessage: ExtendedUIMessage) => {
    const executionMessageParts = agentMessage.parts.filter(
      (part) =>
        part.type === 'tool-execute_tool' && part.state === 'output-available',
    ) as ToolUIPart[];

    // TODO: detect if messages are incoming or just loaded from chat history.
    if (executionMessageParts.length > 0) {
      for (const executionPart of executionMessageParts) {
        const toolExecutionPart = executionPart as Prettify<ToolUIPart>;

        console.log({
          toolExecutionPart,
        });

        const toolExecutionOutput = toolExecutionPart.output as Record<
          string,
          any
        >;

        if (toolExecutionOutput.toolName === 'navigate_app') {
          const toolExecutionResult = toolExecutionOutput.result as Record<
            string,
            any
          >;

          if (!isDefined(toolExecutionResult)) {
            continue;
          }

          if (toolExecutionResult.success !== true) {
            continue;
          }

          const messageId = agentMessage.id;

          const processedNavigationMessageIds = store.get(
            processedNavigationMessageIdsCallbackState,
          );

          if (processedNavigationMessageIds.includes(messageId)) {
            continue;
          }

          store.set(processedNavigationMessageIdsCallbackState, [
            ...processedNavigationMessageIds,
            messageId,
          ]);

          const navigateAppOutput =
            toolExecutionResult?.result as NavigateAppToolOutput;

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

  const agentChatMessageFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      agentChatMessageComponentFamilyState,
    );

  const getUpdatedAgentMessages = useCallback(
    (updatedMessages: ExtendedUIMessage[]) => {
      let updatedMessagesToProcess: ExtendedUIMessage[] = [];

      store.set(
        atom(null, (get, batchSet) => {
          const existingAgentChatMessages = get(agentChatMessagesCallbackState);

          for (const updatedMessage of updatedMessages) {
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

                updatedMessagesToProcess.push(updatedMessage);
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

              updatedMessagesToProcess.push(updatedMessage);
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
    ],
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
