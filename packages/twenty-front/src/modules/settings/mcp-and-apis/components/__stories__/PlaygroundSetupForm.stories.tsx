import { PlaygroundSetupForm } from '@/settings/mcp-and-apis/components/PlaygroundSetupForm';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof PlaygroundSetupForm> = {
  title: 'Modules/Settings/Playground/PlaygroundSetupForm',
  component: PlaygroundSetupForm,
  decorators: [ComponentDecorator, MemoryRouterDecorator, ToastDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'A form component for setting up the API playground with API key, schema selection, and playground type.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PlaygroundSetupForm>;

export const Default: Story = {
  args: {},
};
