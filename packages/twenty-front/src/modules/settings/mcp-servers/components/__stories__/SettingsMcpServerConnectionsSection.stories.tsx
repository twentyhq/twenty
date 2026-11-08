import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ConnectionProviderScope } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import {
  mockedMcpServer,
  mockedMcpServerSignInConnectedAccounts,
  mockedMcpServerSignInConnectionProvider,
  mockedMcpServerSignInUserWorkspaceId,
} from '~/testing/mock-data/mcp-servers';

const CurrentWorkspaceMemberDecorator: Decorator = (Story) => {
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );

  useEffect(() => {
    setCurrentWorkspaceMember({
      ...getRecordFromRecordNode<WorkspaceMember>({
        recordNode: mockedWorkspaceMemberRecords[0],
      }),
      userWorkspaceId: mockedMcpServerSignInUserWorkspaceId,
    });
  }, [setCurrentWorkspaceMember]);

  return <Story />;
};

const buildConnectedAccountsHandlers = (
  myConnectedAccounts: typeof mockedMcpServerSignInConnectedAccounts,
) => [
  graphql.query('MyConnectedAccounts', () =>
    HttpResponse.json({ data: { myConnectedAccounts } }),
  ),
  graphql.query('MyMessageChannels', () =>
    HttpResponse.json({ data: { myMessageChannels: [] } }),
  ),
  graphql.query('MyCalendarChannels', () =>
    HttpResponse.json({ data: { myCalendarChannels: [] } }),
  ),
];

const meta: Meta<typeof SettingsMcpServerConnectionsSection> = {
  title: 'Modules/Settings/McpServers/SettingsMcpServerConnectionsSection',
  component: SettingsMcpServerConnectionsSection,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ToastDecorator,
    CurrentWorkspaceMemberDecorator,
  ],
  args: {
    mcpServerId: mockedMcpServer.id,
    connectionProvider: mockedMcpServerSignInConnectionProvider,
    signInScope: ConnectionProviderScope.USER,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsMcpServerConnectionsSection>;

export const Connected: Story = {
  parameters: {
    msw: {
      handlers: buildConnectedAccountsHandlers(
        mockedMcpServerSignInConnectedAccounts,
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@apple.dev', undefined, { timeout: 3000 });

    expect(
      canvas.getByRole('button', { name: 'Add connection' }),
    ).toBeVisible();
  },
};

export const NotConnected: Story = {
  // Another provider, so the accounts cached by the other story do not match
  args: {
    connectionProvider: {
      ...mockedMcpServerSignInConnectionProvider,
      id: '20202020-6d63-4070-8000-000000000099',
    },
  },
  parameters: {
    msw: {
      handlers: buildConnectedAccountsHandlers([]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Sign in to use this server', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  },
};

export const SharedNotConnected: Story = {
  // Another provider, so the accounts cached by the other stories do not match
  args: {
    connectionProvider: {
      ...mockedMcpServerSignInConnectionProvider,
      id: '20202020-6d63-4070-8000-000000000098',
    },
    signInScope: ConnectionProviderScope.WORKSPACE,
  },
  parameters: {
    msw: {
      handlers: buildConnectedAccountsHandlers([]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Connect the shared account', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.getByText('Shared connection')).toBeVisible();
  },
};
