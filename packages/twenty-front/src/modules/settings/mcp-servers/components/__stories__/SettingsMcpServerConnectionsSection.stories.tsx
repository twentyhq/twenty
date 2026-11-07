import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { metadataGraphql } from '~/testing/graphqlMocks';
import {
  mockedMcpServer,
  mockedMcpServerConnections,
} from '~/testing/mock-data/mcp-servers';

const [ownConnection] = mockedMcpServerConnections;

const meta: Meta<typeof SettingsMcpServerConnectionsSection> = {
  title: 'Modules/Settings/McpServers/SettingsMcpServerConnectionsSection',
  component: SettingsMcpServerConnectionsSection,
  decorators: [ComponentDecorator, MemoryRouterDecorator, ToastDecorator],
  args: { mcpServerId: mockedMcpServer.id },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyMcpServerConnections', () =>
          HttpResponse.json({
            data: { mcpServerConnections: mockedMcpServerConnections },
          }),
        ),
        metadataGraphql.mutation('DeleteMcpServerConnection', () =>
          HttpResponse.json({
            data: { deleteMcpServerConnection: ownConnection },
          }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SettingsMcpServerConnectionsSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(canvas.getByText('Only you')).toBeVisible();
    expect(canvas.getByText('Workspace')).toBeVisible();
    expect(canvas.getByText('Connected')).toBeVisible();
    expect(canvas.getByText('Sign in again')).toBeVisible();
  },
};

export const Disconnect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Disconnect tim@apple.dev' },
        { timeout: 3000 },
      ),
    );

    await waitFor(() => expect(canvas.queryByText('tim@apple.dev')).toBeNull());
    expect(canvas.getByText('jony@apple.dev')).toBeVisible();
  },
};

export const Empty: Story = {
  // Another server, so the connections cached by the other stories do not apply
  args: { mcpServerId: '20202020-6d63-4070-8000-000000000099' },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyMcpServerConnections', () =>
          HttpResponse.json({ data: { mcpServerConnections: [] } }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Connect' }, { timeout: 3000 });

    expect(
      canvas.getByRole('button', { name: 'Connect for workspace' }),
    ).toBeVisible();
    expect(canvas.queryByText('Account')).toBeNull();
  },
};
