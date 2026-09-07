import { useLocation } from 'react-router-dom';

import { isSettingsPath } from '~/utils/isSettingsPath';

export const useIsSettingsPage = () => isSettingsPath(useLocation().pathname);
