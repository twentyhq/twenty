import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

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
      link: '/settings/integrations/mcp',
    },
  ],
};
