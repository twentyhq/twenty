import { Navigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { ExpandedAiChat } from '@/ai/expanded-chat/components/ExpandedAiChat';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AiChatPage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  // Permission flags are empty until the user workspace is hydrated; deciding
  // before that would bounce authorized users visiting /chat directly.
  if (!isDefined(currentUserWorkspace)) {
    return null;
  }

  if (!hasAiPermission) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return <ExpandedAiChat />;
};
