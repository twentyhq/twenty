import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { getWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useCallback } from 'react';

export const useWorkspaceSurfaceScopedComponentInstanceIdResolver = () => {
  const workspaceSurface = useWorkspaceSurface();

  return useCallback(
    (componentInstanceId: string) =>
      getWorkspaceSurfaceScopedComponentInstanceId({
        componentInstanceId,
        surfaceType: workspaceSurface.type,
        surfaceInstanceId: workspaceSurface.instanceId,
      }),
    [workspaceSurface.instanceId, workspaceSurface.type],
  );
};
