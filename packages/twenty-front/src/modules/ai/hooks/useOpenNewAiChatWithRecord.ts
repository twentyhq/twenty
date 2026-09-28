import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatNewThreadRecordTargetState } from '@/ai/states/agentChatNewThreadRecordTargetState';
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
  const setAgentChatNewThreadRecordTarget = useSetAtomState(
    agentChatNewThreadRecordTargetState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const openNewAiChatWithRecord = ({
    objectNameSingular,
    recordId,
  }: AgentChatRecordTarget) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectNameSingular,
    );
    const record = store.get(recordStoreFamilyState.atomFamily(recordId));

    if (!isDefined(objectMetadataItem) || !isDefined(record)) {
      return;
    }

    const recordIdentifier = getObjectRecordIdentifier({
      objectMetadataItem,
      record,
      allowRequestsToTwentyIcons,
    });

    switchToNewChat();
    setAgentChatNewThreadRecordTarget({ objectNameSingular, recordId });
    stageAiChatPrepromptDocument({
      serializedDocument: serializeMentionTagAsAdvancedTextEditorDocument({
        recordId,
        objectNameSingular,
        label: recordIdentifier.name,
        imageUrl: recordIdentifier.avatarUrl,
      }),
      mode: 'PREFILL',
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return { openNewAiChatWithRecord };
};
