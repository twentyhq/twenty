import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useContext } from 'react';

export const useWorkspaceSurface = () => useContext(WorkspaceSurfaceContext);
