import { useNavigate } from 'react-router-dom';
import { type AppPath, type NavigateOptions } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { useSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useSidePanelRoutedSurface';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';

export type NavigateAppOptions = NavigateOptions & {
  // A caller that has already decided the main outlet is the destination, like
  // the mobile escape out of the panel, opts out of being hosted on the right.
  surface?: 'main';
};

export const useNavigateApp = () => {
  const navigate = useNavigate();
  const sidePanelRoutedSurface = useSidePanelRoutedSurface();

  return <T extends AppPath>(
    to: T,
    params?: Parameters<typeof getAppPath<T>>[1],
    queryParams?: Record<string, any>,
    options?: NavigateAppOptions,
  ) => {
    const path = getAppPath(to, params, queryParams);

    if (
      options?.surface !== 'main' &&
      isDefined(sidePanelRoutedSurface) &&
      isSidePanelHostablePath(path)
    ) {
      return sidePanelRoutedSurface.navigateFromSidePanel(path);
    }

    // A target the panel cannot host belongs on the main outlet, so it keeps
    // whatever the main surface would have done with it.
    return navigate(path, options);
  };
};
