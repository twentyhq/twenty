import { processedToolExecutionPartIdsComponentState } from '@/ai/states/processedToolExecutionPartIdsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useClaimUnprocessedToolCallParts = () => {
  const processedToolExecutionPartIdsCallbackState =
    useAtomComponentStateCallbackState(
      processedToolExecutionPartIdsComponentState,
    );

  const store = useStore();

  const claimUnprocessedToolCallParts = <
    TToolCallPart extends { toolCallId: string },
  >(
    toolCallParts: TToolCallPart[],
  ): TToolCallPart[] => {
    const processedToolExecutionPartIds = store.get(
      processedToolExecutionPartIdsCallbackState,
    );

    const unprocessedToolCallParts = toolCallParts.filter(
      (part) => !processedToolExecutionPartIds.includes(part.toolCallId),
    );

    if (unprocessedToolCallParts.length > 0) {
      store.set(processedToolExecutionPartIdsCallbackState, [
        ...processedToolExecutionPartIds,
        ...unprocessedToolCallParts.map((part) => part.toolCallId),
      ]);
    }

    return unprocessedToolCallParts;
  };

  return { claimUnprocessedToolCallParts };
};
