import { useMemo } from 'react';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { filterNewParticipantMentions } from '@/ai/utils/filterNewParticipantMentions';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPendingParticipantMentions = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const draftKey = currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const serializedDraft =
    useAtomStateValue(agentChatDraftsByThreadIdState)[draftKey] ?? '';
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    draftKey,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const participantMentions = useMemo(
    () => getParticipantMentionsFromSerializedDocument(serializedDraft),
    [serializedDraft],
  );

  return filterNewParticipantMentions({
    participantMentions,
    thread,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
};
