import { useLocation } from 'react-router-dom';

import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { isAiModePath } from '~/utils/isAiModePath';

export const useIsAiChatArtifactSurface = () => {
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const isWorkspaceSetupChatActive = useAtomStateValue(
    isWorkspaceSetupChatActiveState,
  );

  return (
    isAiModePath(pathname, inboxRecordRouteObjectNames) &&
    !isWorkspaceSetupChatActive
  );
};
