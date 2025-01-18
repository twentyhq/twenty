import { AppPath } from '@/types/AppPath';
import { useNavigate } from 'react-router-dom';
import { appLink } from '~/utils/navigation/appLink';

export const useNavigateApp = () => {
  const navigate = useNavigate();

  return <T extends AppPath>(
    to: T,
    params?: Parameters<typeof appLink<T>>[1],
    options?: {
      replace?: boolean;
      state?: any;
    },
  ) => {
    const path = appLink(to, params);
    return navigate(path, options);
  };
};
