import { PlaygroundSetupForm } from '@/settings/playground/components/PlaygroundSetupForm';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof PlaygroundSetupForm> = {
  title: 'Modules/Settings/Playground/PlaygroundSetupForm',
  component: PlaygroundSetupForm,
  decorators: [ComponentDecorator, RouterDecorator, I18nFrontDecorator],
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
