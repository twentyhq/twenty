import { SettingsPath } from 'twenty-shared/types';

import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useNavigateToMcpServersList = () => {
  const navigateSettings = useNavigateSettings();

  const navigateToMcpServersList = () =>
    navigateSettings(
      SettingsPath.AI,
      undefined,
      undefined,
      undefined,
      SETTINGS_AI_TABS.TABS_IDS.TOOLS,
    );

  return { navigateToMcpServersList };
};
