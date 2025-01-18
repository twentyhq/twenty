import { SettingsPath } from '@/types/SettingsPath';
import { useNavigate } from 'react-router-dom';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const useNavigateSettings = () => {
  const navigate = useNavigate();

  return <T extends SettingsPath>(
    to: T,
    params?: Parameters<typeof settingsLink<T>>[1],
    options?: {
      replace?: boolean;
      state?: any;
    },
  ) => {
    const path = settingsLink(to, params);
    return navigate(path, options);
  };
};
