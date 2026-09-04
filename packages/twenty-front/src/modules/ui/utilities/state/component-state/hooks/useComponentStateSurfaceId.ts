import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';

// The surface every component state hook keys against. Component states that
// declare 'shared' ignore it; the rest use it to stay isolated between the main
// outlet and each side panel page.
export const useComponentStateSurfaceId = (): string =>
  useWorkspaceSurface().instanceId;
