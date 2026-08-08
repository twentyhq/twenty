import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { extractUIToolCallParts } from '@/ai/utils/extractUIToolCallParts';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

export const useProcessUIToolCallMessage = () => {
  const { openRecordTarget, openViewTarget } = useChatTargetNavigation();

  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const processUIToolCallMessage = async (
    uiToolCallMessage: ExtendedUIMessage,
  ) => {
    const uiToolCallMessageParts = extractUIToolCallParts(
      uiToolCallMessage.parts,
    );

    const alreadyProcessedToolExecutionPartIds = store.get(
      processedToolExecutionPartIdsCallbackState,
    );

    const toolCallMessagePartsToProcess = uiToolCallMessageParts.filter(
      (part) => !alreadyProcessedToolExecutionPartIds.includes(part.toolCallId),
    );

    for (const toolExecutionPart of toolCallMessagePartsToProcess) {
      if (!isDefined(toolExecutionPart.output)) {
        continue;
      }

      if (toolExecutionPart.output.success !== true) {
        continue;
      }

      store.set(processedToolExecutionPartIdsCallbackState, [
        ...alreadyProcessedToolExecutionPartIds,
        toolExecutionPart.toolCallId,
      ]);

      const navigateAppOutput = toolExecutionPart.output.result;

      if (!isDefined(navigateAppOutput)) {
        continue;
      }

      switch (navigateAppOutput.action) {
        case 'navigateToObject': {
          openViewTarget({
            objectNameSingular: navigateAppOutput.objectNameSingular,
          });

          break;
        }
        case 'navigateToRecord': {
          openRecordTarget({
            recordId: navigateAppOutput.recordId,
            objectNameSingular: navigateAppOutput.objectNameSingular,
          });

          break;
        }
        case 'navigateToView': {
          openViewTarget({
            objectNameSingular: navigateAppOutput.objectNameSingular,
            viewId: navigateAppOutput.viewId,
          });

          break;
        }
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
