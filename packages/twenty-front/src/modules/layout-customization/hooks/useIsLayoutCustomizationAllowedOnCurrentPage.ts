import { useLocation } from 'react-router-dom';

import { isAiChatAreaPath } from '~/utils/isAiChatAreaPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const useIsLayoutCustomizationAllowedOnCurrentPage = () => {
  const { pathname } = useLocation();

  return !isAiChatAreaPath(pathname) && !isSettingsPath(pathname);
};
