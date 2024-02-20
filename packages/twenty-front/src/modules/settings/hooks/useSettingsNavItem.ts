import { useMatch, useResolvedPath } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

export const useSettingsNavItem = <Path extends SettingsPath>({
  path,
  matchSubPages = false,
}: {
  path: Path;
  matchSubPages?: boolean;
}) => ({
  to: getSettingsPagePath(path),
  isActive: !!useMatch({
    path: useResolvedPath(getSettingsPagePath(path)).pathname,
    end: !matchSubPages,
  }),
});
