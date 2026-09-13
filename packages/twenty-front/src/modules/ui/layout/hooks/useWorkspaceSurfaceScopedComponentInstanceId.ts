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

// Only for the place that creates an id for something the same page instance
// can mount once per workspace surface (a record index, a page layout, a
// settings tab bar). The id it returns is then passed around and used verbatim:
// Dropdown, Modal, SelectableList, TabList and ScrollWrapper never rewrite the
// id they are given, so a reader holding the same id always reads the same
// state.
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
