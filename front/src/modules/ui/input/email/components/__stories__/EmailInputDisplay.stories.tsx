import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { EmailInputDisplay } from '../EmailInputDisplay';

const meta: Meta = {
  title: 'UI/Input/EmailInputDisplay',
  component: EmailInputDisplay,
  decorators: [ComponentWithRouterDecorator],
  args: {
    value: 'mustajab.ikram@google.com',
  },
};

export default meta;

type Story = StoryObj<typeof EmailInputDisplay>;

export const Default: Story = {};
