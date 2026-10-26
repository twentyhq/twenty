import { useLocation } from 'react-router-dom';

import { isAiModePath } from '~/utils/isAiModePath';

export const useIsLayoutCustomizationAllowedOnCurrentPage = () => {
  const { pathname } = useLocation();

  return !isAiModePath(pathname);
};
