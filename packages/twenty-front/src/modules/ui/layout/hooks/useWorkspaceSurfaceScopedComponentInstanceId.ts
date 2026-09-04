// Makes an identifier unique per workspace surface. Component state no longer
// needs this - its atoms are keyed by surface from the ComponentSurfaceScope its
// context declares. What is left are the identifiers that are not component
// state: DOM element ids, storage keys, SSE query ids, plain family state keys,
// and the ids of subsystems that key off the same string as the DOM (a dropdown
// and a modal also register a focus id under it).
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isNonEmptyString } from '@sniptt/guards';
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
    !isNonEmptyString(surfaceInstanceId) ||
    !isNonEmptyString(componentInstanceId) ||
    componentInstanceId === surfaceInstanceId ||
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
