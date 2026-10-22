import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { SettingsDevelopersMcpServerDetail } from '~/pages/settings/developers/mcp-servers/components/SettingsDevelopersMcpServerDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsDevelopersMcpServerDetail',
  component: SettingsDevelopersMcpServerDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/developers/mcp-servers/:mcpServerId',
    routeParams: { ':mcpServerId': '5678' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersMcpServerDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('https://docs.twenty.com/mcp', undefined, {
      timeout: 3000,
    });
    await canvas.findByDisplayValue('docs');
    await canvas.findByText('Authorization header: set');
    await canvas.findByText('search_twenty_documentation');
    await canvas.findByText('Refresh tools');
    await canvas.findByText('Delete this MCP server');
  },
};
