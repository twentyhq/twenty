import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import { SettingsDevelopersMcpServerNew } from '~/pages/settings/developers/mcp-servers/components/SettingsDevelopersMcpServerNew';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsDevelopersMcpServerNew',
  component: SettingsDevelopersMcpServerNew,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/developers/mcp-servers/new',
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('ApplicationConnectionProviders', () =>
          HttpResponse.json({ data: { applicationConnectionProviders: [] } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersMcpServerNew>;

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
