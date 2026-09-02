import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { extractCompletedWorkspaceSetupToolParts } from '@/ai/utils/extractCompletedWorkspaceSetupToolParts';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const useProcessWorkspaceSetupCompletion = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: true,
    destinationPath: getAppPath(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Company,
    }),
  });

  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const processWorkspaceSetupCompletion = (
    message: Pick<ExtendedUIMessage, 'parts'>,
  ) => {
    const completedParts = extractCompletedWorkspaceSetupToolParts(
      message.parts,
    );

    const alreadyProcessedToolExecutionPartIds = store.get(
      processedToolExecutionPartIdsCallbackState,
    );

    const partsToProcess = completedParts.filter(
      (part) => !alreadyProcessedToolExecutionPartIds.includes(part.toolCallId),
    );

    if (!isNonEmptyArray(partsToProcess)) {
      return;
    }

    store.set(processedToolExecutionPartIdsCallbackState, [
      ...alreadyProcessedToolExecutionPartIds,
      ...partsToProcess.map((part) => part.toolCallId),
    ]);

    if (!isWorkspaceSetupChat) {
      return;
    }

    returnFromExpandedAiChat();
  };

  return {
    processWorkspaceSetupCompletion,
  };
};
