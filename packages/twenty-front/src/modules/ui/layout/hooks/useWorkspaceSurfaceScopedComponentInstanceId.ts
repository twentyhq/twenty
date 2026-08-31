import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';

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
