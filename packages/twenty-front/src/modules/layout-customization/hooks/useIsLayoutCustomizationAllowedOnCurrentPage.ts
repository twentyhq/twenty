import { useLocation } from 'react-router-dom';

import { isCoreAgentPath } from '@/object-core/agents/utils/isCoreAgentPath';
import { isAiModePath } from '~/utils/isAiModePath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const useIsLayoutCustomizationAllowedOnCurrentPage = () => {
  const { pathname } = useLocation();

  return (
    !isAiModePath(pathname) &&
    !isSettingsPath(pathname) &&
    !isCoreAgentPath(pathname)
  );
};
