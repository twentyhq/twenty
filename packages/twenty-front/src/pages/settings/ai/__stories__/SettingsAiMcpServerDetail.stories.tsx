import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import { SettingsAiMcpServerDetail } from '~/pages/settings/ai/SettingsAiMcpServerDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import {
  mockedMcpServer,
  mockedMcpServerConnections,
} from '~/testing/mock-data/mcp-servers';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsAiMcpServerDetail',
  component: SettingsAiMcpServerDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai/mcp-servers/:mcpServerId',
    routeParams: { ':mcpServerId': mockedMcpServer.id },
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindOneMcpServer', () =>
          HttpResponse.json({ data: { mcpServer: mockedMcpServer } }),
        ),
        metadataGraphql.query('FindManyMcpServerConnections', () =>
          HttpResponse.json({
            data: { mcpServerConnections: mockedMcpServerConnections },
          }),
        ),
        metadataGraphql.query('ApplicationConnectionProviders', () =>
          HttpResponse.json({ data: { applicationConnectionProviders: [] } }),
        ),
        metadataGraphql.mutation('SyncMcpServerTools', () =>
          HttpResponse.json({
            data: {
              syncMcpServerTools: {
                ...mockedMcpServer,
                tools: [
                  ...mockedMcpServer.tools,
                  {
                    __typename: 'McpServerTool',
                    name: 'create_issue',
                    description: 'Create an issue',
                    inputSchema: { type: 'object' },
                    annotations: null,
                  },
                ],
              },
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAiMcpServerDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('https://mcp.linear.app/mcp', undefined, {
      timeout: 3000,
    });

    expect(canvas.getByDisplayValue('linear')).toBeDisabled();
    await canvas.findByText('search_issues');
    await canvas.findByText('tim@apple.dev');
    expect(canvas.getByText('Sign in again')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Connect' })).toBeVisible();
    await canvas.findByRole('button', { name: 'Deactivate' });
  },
};

export const SyncKeepsUnsavedEdits: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labelInput = await canvas.findByDisplayValue('Linear', undefined, {
      timeout: 3000,
    });

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, 'Linear issues');
    await userEvent.click(canvas.getByRole('button', { name: 'Sync tools' }));

    await canvas.findByText('create_issue');
    expect(canvas.getByDisplayValue('Linear issues')).toBeVisible();
  },
};
