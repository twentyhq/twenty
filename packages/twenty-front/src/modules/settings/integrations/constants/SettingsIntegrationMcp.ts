import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

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
      to: null,
      type: 'Copy',
      content: JSON.stringify(
        {
          mcpServers: {
            twenty: {
              type: 'remote',
              url: `${REACT_APP_SERVER_BASE_URL}/mcp`,
              headers: {
                Authorization: 'Bearer [API_KEY]',
              },
            },
          },
        },
        null,
        2,
      ),
      text: 'Connect MCP Client',
      link: '#',
      linkText: 'Copy',
    },
  ],
};
