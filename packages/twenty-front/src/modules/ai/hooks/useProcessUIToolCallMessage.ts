import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { useStore } from 'jotai';
import {
  type ExtendedUIMessage,
  type NavigateAppToolOutput,
} from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { sleep } from '~/utils/sleep';

export type AgentChatMessageUIToolCallPart = {
  type: 'tool-execute_tool';
  toolCallId: string;
  state: string;
  output: {
    toolName: string;
    result: {
      message: string;
      result: NavigateAppToolOutput;
      success: boolean;
    };
  };
};

export const useProcessUIToolCallMessage = () => {
  const navigateApp = useNavigateApp();

  const { objectMetadataItems } = useObjectMetadataItems();

  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const processUIToolCallMessage = async (
    uiToolCallMessage: ExtendedUIMessage,
  ) => {
    const toolCallMessageParts = uiToolCallMessage.parts.filter(
      (part) => part.type === 'tool-execute_tool',
    ) as unknown as AgentChatMessageUIToolCallPart[];

    const alreadyProcessedToolExecutionPartIds = store.get(
      processedToolExecutionPartIdsCallbackState,
    );

    const toolCallMessagePartsToProcess = toolCallMessageParts.filter(
      (part) => !alreadyProcessedToolExecutionPartIds.includes(part.toolCallId),
    );

    for (const toolExecutionPart of toolCallMessagePartsToProcess) {
      // console.log({ toolExecutionPart });-

      if (!isDefined(toolExecutionPart.output)) {
        continue;
      }

      if (toolExecutionPart.output.result.success !== true) {
        continue;
      }

      store.set(processedToolExecutionPartIdsCallbackState, [
        ...alreadyProcessedToolExecutionPartIds,
        toolExecutionPart.toolCallId,
      ]);

      const navigateAppOutput = toolExecutionPart.output.result.result;

      // console.log({
      //   navigateAppOutput,
      // });

      switch (navigateAppOutput.action) {
        case 'navigateToDefaultViewForObject': {
          const objectNamePlural =
            objectMetadataItems.find(
              (item) =>
                item.nameSingular === navigateAppOutput.objectNameSingular,
            )?.namePlural ?? 'companies';

          // console.log(
          //   'navigating to default view for object',
          //   navigateAppOutput.objectNameSingular,
          //   objectNamePlural,
          // );

          navigateApp(AppPath.RecordIndexPage, {
            objectNamePlural: objectNamePlural,
          });

          break;
        }
        case 'navigateToRecordPage': {
          navigateApp(AppPath.RecordShowPage, {
            objectNameSingular: navigateAppOutput.objectNameSingular,
            objectRecordId: navigateAppOutput.recordId,
          });

          break;
        }
        case 'navigateToIndexPageView':
          // TODO: implement
          break;
        case 'wait': {
          await sleep(navigateAppOutput.durationMs);
          break;
        }
        default:
          break;
      }
    }
  };

  return {
    processUIToolCallMessage,
  };
};
