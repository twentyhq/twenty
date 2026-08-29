import { useNavigate } from 'react-router-dom';
import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { useSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useSidePanelRoutedSurface';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';

export const useNavigateApp = () => {
  const navigate = useNavigate();
  const sidePanelRoutedSurface = useSidePanelRoutedSurface();

  return <T extends AppPath>(
    to: T,
    params?: Parameters<typeof getAppPath<T>>[1],
    queryParams?: Record<string, any>,
    options?: NavigateOptions,
  ) => {
    const path = getAppPath(to, params, queryParams);

    // A target the panel cannot host belongs on the main outlet, so it keeps
    // whatever the main surface would have done with it.
    if (isDefined(sidePanelRoutedSurface) && isSidePanelHostablePath(path)) {
      return sidePanelRoutedSurface.navigateFromSidePanel(path);
    }

    return navigate(path, options);
  };
};
