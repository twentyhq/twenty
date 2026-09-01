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

      if (workspaceSurface.type === 'main') {
        openSettingsMenu();
      }

      return navigate(path, options);
    },
    [navigate, openSettingsMenu, workspaceSurface.type],
  );
};
