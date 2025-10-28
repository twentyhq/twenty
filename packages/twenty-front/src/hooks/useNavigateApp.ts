import { useNavigate } from 'react-router-dom';
import { type AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const useNavigateApp = () => {
  const navigate = useNavigate();

  return <T extends AppPath>(
    to: T,
    params?: Parameters<typeof getAppPath<T>>[1],
    queryParams?: Record<string, any>,
    options?: {
      replace?: boolean;
      state?: any;
    },
  ) => {
    const path = getAppPath(to, params, queryParams);
    return navigate(path, options);
  };
};
