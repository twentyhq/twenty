import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SettingsDevelopersMcpServerNew } from '~/pages/settings/developers/mcp-servers/components/SettingsDevelopersMcpServerNew';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsDevelopersMcpServerNew',
  component: SettingsDevelopersMcpServerNew,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/developers/mcp-servers/new',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersMcpServerNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New MCP server', undefined, { timeout: 3000 });
    await canvas.findByPlaceholderText('https://example.com/mcp');
    await canvas.findByPlaceholderText('Bearer <token>');

    expect(canvas.queryByText('Danger zone')).not.toBeInTheDocument();
    expect(canvas.queryByText('Refresh tools')).not.toBeInTheDocument();
  },
};
