import { SettingsMcpSetup } from '@/settings/mcp-and-apis/components/SettingsMcpSetup';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsMcpSetup> = {
  title: 'Modules/Settings/Playground/SettingsMcpSetup',
  component: SettingsMcpSetup,
  decorators: [ComponentDecorator, SnackBarDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'SettingsMcpSetup lists the MCP clients that can connect to the workspace, with quick-install and manual configuration options.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SettingsMcpSetup>;

export const Default: Story = {};
