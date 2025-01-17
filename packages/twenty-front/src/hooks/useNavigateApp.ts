import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { generatePath, PathParam, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

type AppPathType = AppPath | `${AppPath.Settings}/${SettingsPath}`;

export const useNavigateApp = () => {
  const navigate = useNavigate();

  return <T extends AppPathType>(
    to: T,
    params?: { [key in PathParam<T>]: string | null },
    options?: {
      replace?: boolean;
      state?: any;
    },
  ) => {
    if (isDefined(params)) {
      const path = generatePath<T>(to, params);
      return navigate(path, options);
    }
    return navigate(to, options);
  };
};
