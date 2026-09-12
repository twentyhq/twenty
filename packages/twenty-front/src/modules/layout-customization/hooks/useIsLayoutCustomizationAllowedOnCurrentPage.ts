import { useLocation } from 'react-router-dom';

import { isAiChatPath } from '~/utils/isAiChatPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const useIsLayoutCustomizationAllowedOnCurrentPage = () => {
  const { pathname } = useLocation();

  return !isAiChatPath(pathname) && !isSettingsPath(pathname);
};
