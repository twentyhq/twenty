import { SettingsPath } from 'twenty-shared/types';

import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useNavigateToMcpServersTab = () => {
  const navigateSettings = useNavigateSettings();

  const navigateToMcpServersTab = () =>
    navigateSettings(
      SettingsPath.Developers,
      undefined,
      undefined,
      undefined,
      SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
    );

  return { navigateToMcpServersTab };
};
