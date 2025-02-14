import { SettingsPath } from '@/types/SettingsPath';
import { useNavigate } from 'react-router-dom';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
