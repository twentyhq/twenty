import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsMcpServersTable } from '@/settings/mcp-servers/components/SettingsMcpServersTable';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { metadataGraphql } from '~/testing/graphqlMocks';
import { mockedMcpServer } from '~/testing/mock-data/mcp-servers';

const mockedMcpServers = [
  mockedMcpServer,
  {
    ...mockedMcpServer,
    id: '20202020-6d63-4070-8000-000000000003',
    name: 'notion',
    label: 'Notion',
    url: 'https://mcp.notion.com/mcp',
    tools: [],
    toolsSyncError: 'Connection refused',
  },
  {
    ...mockedMcpServer,
    id: '20202020-6d63-4070-8000-000000000004',
    name: 'deepwiki',
    label: 'DeepWiki',
    url: 'https://mcp.deepwiki.com/mcp',
    isActive: false,
  },
];

const meta: Meta<typeof SettingsMcpServersTable> = {
  title: 'Modules/Settings/McpServers/SettingsMcpServersTable',
  component: SettingsMcpServersTable,
  decorators: [ComponentDecorator, MemoryRouterDecorator, ToastDecorator],
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyMcpServers', () =>
          HttpResponse.json({ data: { mcpServers: mockedMcpServers } }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SettingsMcpServersTable>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Linear', undefined, { timeout: 3000 });

    expect(canvas.getByText('mcp.linear.app')).toBeVisible();
    expect(canvas.getByText('2 tools')).toBeVisible();
    expect(canvas.getByText('Sync failed')).toBeVisible();
    expect(canvas.getByText('Inactive')).toBeVisible();
  },
};
