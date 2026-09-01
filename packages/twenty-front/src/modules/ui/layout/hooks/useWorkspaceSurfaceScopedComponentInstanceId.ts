import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useCallback } from 'react';

export const getWorkspaceSurfaceScopedComponentInstanceId = ({
  componentInstanceId,
  surfaceType,
  surfaceInstanceId,
}: {
  componentInstanceId: string;
  surfaceType: 'main' | 'side-panel';
  surfaceInstanceId: string;
}) => {
  if (
    surfaceType !== 'side-panel' ||
    surfaceInstanceId.length === 0 ||
    componentInstanceId.length === 0 ||
    componentInstanceId.endsWith(`-${surfaceInstanceId}`)
  ) {
    return componentInstanceId;
  }

  return `${componentInstanceId}-${surfaceInstanceId}`;
};

export const useWorkspaceSurfaceScopedComponentInstanceId = (
  componentInstanceId: string,
) => {
  const workspaceSurface = useWorkspaceSurface();

  return getWorkspaceSurfaceScopedComponentInstanceId({
    componentInstanceId,
    surfaceType: workspaceSurface.type,
    surfaceInstanceId: workspaceSurface.instanceId,
  });
};

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
