import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { MCP_SETUP } from '@/settings/mcp/constants/McpSetup';
import { SettingsBuiltInMcpClientApp } from '~/pages/settings/accounts/SettingsBuiltInMcpClientApp';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsBuiltInMcpClientApp',
  component: SettingsBuiltInMcpClientApp,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/:applicationId',
    routeParams: { ':applicationId': 'chatgpt' },
    additionalRoutes: ['/settings/app-preferences'],
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBuiltInMcpClientApp>;

export const ChatGptConnectOpensTheOfficialApp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Work with your Twenty workspace from ChatGPT through the official Twenty app.',
      ),
    ).toBeVisible();
    expect(
      canvas.getByRole('link', { name: /Connect with ChatGPT/ }),
    ).toHaveAttribute('href', MCP_SETUP.chatGptTwentyAppUrl);
  },
};

export const ClaudeOffersToConnect: Story = {
  args: {
    routeParams: { ':applicationId': 'claude' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Work with your Twenty workspace from Claude through the Twenty connector.',
      ),
    ).toBeVisible();
    expect(canvas.getByText('Connect with Claude')).toBeVisible();
  },
};
