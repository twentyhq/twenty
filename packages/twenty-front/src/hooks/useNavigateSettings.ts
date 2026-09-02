import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const useNavigateSettings = () => {
  const navigate = useNavigate();
  const { openSettingsMenu } = useOpenSettingsMenu();
  const workspaceSurface = useWorkspaceSurface();

  return useCallback(
    <T extends SettingsPath>(
      to: T,
      params?: Parameters<typeof getSettingsPath<T>>[1],
      queryParams?: Record<string, any>,
      options?: {
        replace?: boolean;
        state?: any;
        surface?: 'main';
      },
      hash?: string,
    ) => {
      const path = getSettingsPath(to, params, queryParams, hash);

      // A routed side-panel owns its location, and its navigator already opens
      // the settings shell when a path escapes to main. Every other surface
      // navigates the main router directly, so the shell has to be opened here.
      if (
        workspaceSurface.type === 'main' ||
        !workspaceSurface.ownsRouteLocation
      ) {
        openSettingsMenu();
      }

      return navigate(path, options);
    },
    [navigate, openSettingsMenu, workspaceSurface],
  );
};
