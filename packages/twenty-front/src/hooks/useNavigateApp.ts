import { AppPath } from '@/types/AppPath';
import { useNavigate } from 'react-router-dom';
import { getAppPath } from '~/utils/navigation/getAppPath';

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
