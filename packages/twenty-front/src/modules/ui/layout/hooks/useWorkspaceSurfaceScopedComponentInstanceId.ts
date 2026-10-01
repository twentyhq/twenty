import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isNonEmptyString } from '@sniptt/guards';

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

// Only where an id is created for something mounted once per workspace surface; Dropdown, Modal, SelectableList,
// TabList and ScrollWrapper use ids verbatim, so every reader of the returned id shares its state
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
