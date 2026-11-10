import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import { SettingsAiMcpServerDetail } from '~/pages/settings/ai/SettingsAiMcpServerDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { ConnectionProviderScope } from '~/generated-metadata/graphql';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import {
  mockedMcpServer,
  mockedMcpServerSignInConnectionProvider,
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
          HttpResponse.json({
            data: {
              mcpServer: {
                ...mockedMcpServer,
                connectionProviderId:
                  mockedMcpServerSignInConnectionProvider.id,
                signInScope: ConnectionProviderScope.USER,
              },
            },
          }),
        ),
        metadataGraphql.query('ApplicationConnectionProviders', () =>
          HttpResponse.json({
            data: {
              applicationConnectionProviders: [
                mockedMcpServerSignInConnectionProvider,
              ],
            },
          }),
        ),
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({ data: { myMessageChannels: [] } }),
        ),
        graphql.query('MyCalendarChannels', () =>
          HttpResponse.json({ data: { myCalendarChannels: [] } }),
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
    await canvas.findByText('Sign in to use this server');
    expect(canvas.getByText('Each member signs in')).toBeVisible();
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
