import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SETTINGS_INTEGRATION_AI_CATEGORY: SettingsIntegrationCategory = {
  key: 'ai',
  title: 'With AI',
  hyperlink: null,
  integrations: [
    {
      from: {
        key: 'mcp',
        image: '/images/integrations/mcp.svg',
      },
      type: 'Add',
      text: 'Connect MCP Client',
      link: getSettingsPath(SettingsPath.IntegrationMCP),
    },
  ],
};
