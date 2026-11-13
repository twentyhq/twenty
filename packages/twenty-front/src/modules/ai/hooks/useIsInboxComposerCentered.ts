import { useContext } from 'react';

import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { useShouldShowInboxEmptyState } from '@/ai/hooks/useShouldShowInboxEmptyState';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
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
