import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { useClaimUnprocessedToolCallParts } from '@/ai/hooks/useClaimUnprocessedToolCallParts';
import { extractUIToolCallParts } from '@/ai/utils/extractUIToolCallParts';

import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

export const useProcessUIToolCallMessage = () => {
  const { openRecordTarget, openViewTarget } = useChatTargetNavigation();
  const { claimUnprocessedToolCallParts } = useClaimUnprocessedToolCallParts();

  const processUIToolCallMessage = async (
    uiToolCallMessage: ExtendedUIMessage,
  ) => {
    const succeededToolExecutionParts = extractUIToolCallParts(
      uiToolCallMessage.parts,
    ).filter((part) => part.output?.success === true);

    for (const toolExecutionPart of claimUnprocessedToolCallParts(
      succeededToolExecutionParts,
    )) {
      const navigateAppOutput = toolExecutionPart.output?.result;

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
