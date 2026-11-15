import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER } from 'twenty-shared/application';

import { SettingsMarketplaceAppConnectButton } from '@/settings/applications/components/SettingsMarketplaceAppConnectButton';
import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { ComponentDecorator } from 'twenty-ui/testing';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const CONNECTOR_URL = `https://claude.example.com/connectors?connectorUrl=${MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER}`;
const DOCUMENTATION_URL = 'https://docs.example.com/quick-start';

const meta: Meta<typeof SettingsMarketplaceAppConnectButton> = {
  title: 'Modules/Settings/Applications/SettingsMarketplaceAppConnectButton',
  component: SettingsMarketplaceAppConnectButton,
  decorators: [RootDecorator, ComponentDecorator],
  args: { connectUrl: CONNECTOR_URL },
};

export default meta;
type Story = StoryObj<typeof SettingsMarketplaceAppConnectButton>;

export const WithMcpServerUrl: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const connectLink = await canvas.findByRole('link', { name: /Connect/ });

    expect(connectLink).toHaveAttribute(
      'href',
      `https://claude.example.com/connectors?connectorUrl=${encodeURIComponent(
        buildMcpServerUrl(REACT_APP_SERVER_BASE_URL),
      )}`,
    );
    expect(connectLink).toHaveAttribute('target', '_blank');
    expect(canvas.queryByRole('button', { name: /Install/ })).toBeNull();
  },
};

export const WithoutMcpServerUrl: Story = {
  args: { connectUrl: DOCUMENTATION_URL },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: /Connect/ }),
    ).toHaveAttribute('href', DOCUMENTATION_URL);
  },
};
