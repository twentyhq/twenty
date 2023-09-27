import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { EmailDisplay } from '../../../field/meta-types/display/content-display/components/EmailDisplay';

const meta: Meta = {
  title: 'UI/Input/EmailInputDisplay',
  component: EmailDisplay,
  decorators: [ComponentWithRouterDecorator],
  args: {
    value: 'mustajab.ikram@google.com',
  },
};

export default meta;

type Story = StoryObj<typeof EmailDisplay>;

export const Default: Story = {};
