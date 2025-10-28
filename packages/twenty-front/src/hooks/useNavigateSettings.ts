import { useNavigate } from 'react-router-dom';
import { type SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const useNavigateSettings = () => {
  const navigate = useNavigate();

  return <T extends SettingsPath>(
    to: T,
    params?: Parameters<typeof getSettingsPath<T>>[1],
    queryParams?: Record<string, any>,
    options?: {
      replace?: boolean;
      state?: any;
    },
  ) => {
    const path = getSettingsPath(to, params, queryParams);
    return navigate(path, options);
  };
};
