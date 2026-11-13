import { useMemo } from 'react';

import { inboxDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { filterNewParticipantMentions } from '@/ai/utils/filterNewParticipantMentions';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxPendingParticipantMentions = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const newInboxThreadId = useAtomStateValue(newInboxThreadIdState);
  const draftKey = currentInboxThread ?? newInboxThreadId;
  const serializedDraft =
    useAtomStateValue(inboxDraftsByThreadIdState)[draftKey] ?? '';
  const thread = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
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
