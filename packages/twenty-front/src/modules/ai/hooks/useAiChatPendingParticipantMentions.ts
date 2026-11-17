import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { useMemo } from 'react';

import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { filterNewParticipantMentions } from '@/ai/utils/filterNewParticipantMentions';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPendingParticipantMentions = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const draftKey = threadId ?? newAiChatThreadId;
  const serializedDraft =
    useAtomStateValue(aiChatDraftsByThreadIdState)[draftKey] ?? '';
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
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
