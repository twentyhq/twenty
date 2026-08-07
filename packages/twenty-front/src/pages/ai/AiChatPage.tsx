import { Navigate } from 'react-router-dom';

import { ExpandedAiChat } from '@/ai/expanded-chat/components/ExpandedAiChat';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AiChatPage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  // Permission flags hydrate from a persisted snapshot before the current
  // user refresh lands; deciding on them early would bounce users whose AI
  // permission was granted since their last visit.
  if (!isCurrentUserLoaded) {
    return null;
  }

  if (!hasAiPermission) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return <ExpandedAiChat />;
};
