import { RouterProvider } from 'react-router-dom';

import { useCreateWorkspaceAppRouter } from '@/app/hooks/useCreateWorkspaceAppRouter';

export const WorkspaceApp = () => {
  return <RouterProvider router={useCreateWorkspaceAppRouter()} />;
};
