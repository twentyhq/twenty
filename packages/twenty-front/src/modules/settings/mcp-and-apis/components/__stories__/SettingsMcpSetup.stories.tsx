import { SettingsMcpSetup } from '@/settings/mcp-and-apis/components/SettingsMcpSetup';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof SettingsMcpSetup> = {
  title: 'Modules/Settings/Playground/SettingsMcpSetup',
  component: SettingsMcpSetup,
  decorators: [ComponentDecorator, ToastDecorator],
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
