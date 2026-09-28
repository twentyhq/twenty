import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';
import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenNewAiChatWithRecord = () => {
  const store = useStore();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPrepromptDocument } = useStageAiChatPreprompt();
  const setAgentChatPendingRecordTargetByDraftKey = useSetAtomState(
    agentChatPendingRecordTargetByDraftKeyState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const openNewAiChatWithRecord = (recordTarget: AgentChatRecordTarget) => {
    const { objectNameSingular, recordId } = recordTarget;
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectNameSingular,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const record = store.get(recordStoreFamilyState.atomFamily(recordId));
    const recordIdentifier = isDefined(record)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record,
          allowRequestsToTwentyIcons,
        })
      : undefined;

    switchToNewChat();
    setAgentChatPendingRecordTargetByDraftKey((previousRecordTargets) => ({
      ...previousRecordTargets,
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: recordTarget,
    }));
    stageAiChatPrepromptDocument({
      serializedDocument: serializeMentionTagAsAdvancedTextEditorDocument({
        recordId,
        objectNameSingular,
        label: recordIdentifier?.name ?? objectMetadataItem.labelSingular,
        imageUrl: recordIdentifier?.avatarUrl,
      }),
      mode: 'PREFILL',
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return { openNewAiChatWithRecord };
};
