import { Navigate } from 'react-router-dom';

import { ExpandedAiChat } from '@/ai/expanded-chat/components/ExpandedAiChat';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AiChatPage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  if (!hasAiPermission) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return <ExpandedAiChat />;
};
