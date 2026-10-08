import { WorkspaceSurfaceHeaderPortalContext } from '@/ui/layout/contexts/WorkspaceSurfaceHeaderPortalContext';
import { useContext } from 'react';

export const useWorkspaceSurfaceHeaderPortal = () =>
  useContext(WorkspaceSurfaceHeaderPortalContext);
