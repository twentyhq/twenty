import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { SettingsAiMcpServerNew } from '~/pages/settings/ai/SettingsAiMcpServerNew';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsAiMcpServerNew',
  component: SettingsAiMcpServerNew,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai/new-mcp-server',
  },
  parameters: {
    msw: {
      handlers: graphqlMocks.handlers,
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAiMcpServerNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New MCP server', undefined, { timeout: 3000 });
    await canvas.findByPlaceholderText('https://mcp.example.com/mcp');

    expect(canvas.queryByText('Danger zone')).not.toBeInTheDocument();
  },
};

export const InvalidName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameInput = await canvas.findByPlaceholderText('linear', undefined, {
      timeout: 3000,
    });

    await userEvent.type(nameInput, 'Linear Tools');
    await userEvent.tab();

    await canvas.findByText(
      'Use lowercase letters, digits and underscores, starting with a letter',
    );
    expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const NameFollowsLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labelInput = await canvas.findByPlaceholderText('Linear', undefined, {
      timeout: 3000,
    });
    const nameInput = canvas.getByPlaceholderText('linear');

    await userEvent.type(labelInput, 'Linear Tools');
    expect(nameInput).toHaveValue('linear_tools');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'linear');
    await userEvent.type(labelInput, ' v2');
    expect(nameInput).toHaveValue('linear');
  },
};
