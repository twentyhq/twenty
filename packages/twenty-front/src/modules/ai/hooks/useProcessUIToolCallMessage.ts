import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { extractUIToolCallParts } from '@/ai/utils/extractUIToolCallParts';
import { useOpenWorkspaceTarget } from '@/navigation/hooks/useOpenWorkspaceTarget';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

export const useProcessUIToolCallMessage = () => {
  const { openWorkspaceTarget } = useOpenWorkspaceTarget();

  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const getRecordIndexPath = ({
    objectNameSingular,
    viewId,
  }: {
    objectNameSingular: string;
    viewId?: string;
  }) => {
    const objectMetadataItem = store.get(
      objectMetadataItemFamilySelector.selectorFamily({
        objectName: objectNameSingular,
        objectNameType: 'singular',
      }),
    );

    return isDefined(objectMetadataItem)
      ? getAppPath(
          AppPath.RecordIndexPage,
          { objectNamePlural: objectMetadataItem.namePlural },
          isDefined(viewId) ? { viewId } : undefined,
        )
      : null;
  };

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
          const path = getRecordIndexPath({
            objectNameSingular: navigateAppOutput.objectNameSingular,
          });

          if (!isDefined(path)) {
            break;
          }

          openWorkspaceTarget({ path });

          break;
        }
        case 'navigateToRecord': {
          openWorkspaceTarget({
            path: getAppPath(AppPath.RecordShowPage, {
              objectNameSingular: navigateAppOutput.objectNameSingular,
              objectRecordId: navigateAppOutput.recordId,
            }),
          });

          break;
        }
        case 'navigateToView': {
          const path = getRecordIndexPath({
            objectNameSingular: navigateAppOutput.objectNameSingular,
            viewId: navigateAppOutput.viewId,
          });

          if (!isDefined(path)) {
            break;
          }

          openWorkspaceTarget({ path });

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
