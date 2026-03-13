import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { extractUIToolCallParts } from '@/ai/utils/extractUIToolCallParts';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { sleep } from '~/utils/sleep';

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

      if (toolExecutionPart.output.result.success !== true) {
        continue;
      }

      store.set(processedToolExecutionPartIdsCallbackState, [
        ...alreadyProcessedToolExecutionPartIds,
        toolExecutionPart.toolCallId,
      ]);

      const navigateAppOutput = toolExecutionPart.output.result.result;

      switch (navigateAppOutput.action) {
        case 'navigateToObject': {
          const objectNamePlural = objectMetadataItems.find(
            (item) =>
              item.nameSingular === navigateAppOutput.objectNameSingular,
          )?.namePlural;

          if (!isDefined(objectNamePlural)) {
            throw new Error(
              `Object with singular name ${navigateAppOutput.objectNameSingular} not found, cannot navigate to object page from chat.`,
            );
          }

          navigateApp(AppPath.RecordIndexPage, {
            objectNamePlural: objectNamePlural,
          });

          break;
        }
        case 'navigateToRecord': {
          navigateApp(AppPath.RecordShowPage, {
            objectNameSingular: navigateAppOutput.objectNameSingular,
            objectRecordId: navigateAppOutput.recordId,
          });

          break;
        }
        case 'navigateToView': {
          const viewObjectNamePlural = objectMetadataItems.find(
            (item) =>
              item.nameSingular === navigateAppOutput.objectNameSingular,
          )?.namePlural;

          if (!isDefined(viewObjectNamePlural)) {
            throw new Error(
              `Object with singular name ${navigateAppOutput.objectNameSingular} not found, cannot navigate to view from chat.`,
            );
          }

          navigateApp(
            AppPath.RecordIndexPage,
            { objectNamePlural: viewObjectNamePlural },
            { viewId: navigateAppOutput.viewId },
          );

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
