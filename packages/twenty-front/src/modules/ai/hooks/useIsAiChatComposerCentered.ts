import { useContext } from 'react';

import { INBOX_SURFACE } from '@/ai/constants/AiChatSurface';
import { InboxSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useShouldShowInboxEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsInboxComposerCentered = () => {
  const inboxSurface = useContext(InboxSurfaceContext);
  // The workspace setup preamble is its own intro; centering would fight it.
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const shouldShowInboxEmptyState = useShouldShowInboxEmptyState();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    currentInboxThread,
  );

  return (
    inboxSurface === INBOX_SURFACE.PAGE &&
    !isDirectMessage &&
    !isWorkspaceSetupChat &&
    shouldShowInboxEmptyState
  );
};
