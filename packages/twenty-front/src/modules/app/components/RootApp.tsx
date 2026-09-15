import { RouterProvider } from 'react-router-dom';

import { useCreateRootAppRouter } from '@/app/hooks/useCreateRootAppRouter';

export const RootApp = () => {
  return <RouterProvider router={useCreateRootAppRouter()} />;
};
