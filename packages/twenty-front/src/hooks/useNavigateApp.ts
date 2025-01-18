import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigate } from 'react-router-dom';
import { appLink } from '~/utils/navigation/appLink';

type AppPathType = AppPath | `${AppPath.Settings}/${SettingsPath}`;

export const useNavigateApp = () => {
  const navigate = useNavigate();

  return <T extends AppPathType>(
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
