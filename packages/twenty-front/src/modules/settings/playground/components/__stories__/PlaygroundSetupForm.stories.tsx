import { Meta, StoryObj } from '@storybook/react';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { PlaygroundSetupForm } from '../PlaygroundSetupForm';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof PlaygroundSetupForm> = {
  title: 'Modules/Settings/Playground/PlaygroundSetupForm',
  component: PlaygroundSetupForm,
  decorators: [
    ComponentDecorator,
    RouterDecorator,
    I18nFrontDecorator,
    ComponentWithRecoilScopeDecorator,
  ],
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
