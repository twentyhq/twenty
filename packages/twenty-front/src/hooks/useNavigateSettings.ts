import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useSidePanelRoutedSurface';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const useNavigateSettings = () => {
  const navigate = useNavigate();
  const { openSettingsMenu } = useOpenSettingsMenu();
  const sidePanelRoutedSurface = useSidePanelRoutedSurface();

  return useCallback(
    <T extends SettingsPath>(
      to: T,
      params?: Parameters<typeof getSettingsPath<T>>[1],
      queryParams?: Record<string, any>,
      options?: {
        replace?: boolean;
        state?: any;
      },
      hash?: string,
    ) => {
      const path = getSettingsPath(to, params, queryParams, hash);

      if (isDefined(sidePanelRoutedSurface) && isSidePanelHostablePath(path)) {
        return sidePanelRoutedSurface.navigateFromSidePanel(path);
      }

      openSettingsMenu();

      return navigate(path, options);
    },
    [navigate, openSettingsMenu, sidePanelRoutedSurface],
  );
};
