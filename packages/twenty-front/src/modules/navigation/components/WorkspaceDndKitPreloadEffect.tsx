import { useEffect } from 'react';

import { preloadWorkspaceDndKit } from '@/navigation/preloadWorkspaceDndKit';

export const WorkspaceDndKitPreloadEffect = () => {
  useEffect(() => {
    preloadWorkspaceDndKit();
  }, []);

  return null;
};
