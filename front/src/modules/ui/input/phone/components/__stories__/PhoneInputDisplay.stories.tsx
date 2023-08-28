import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { PhoneInputDisplay } from '../PhoneInputDisplay'; // Adjust the import path as needed

const meta: Meta = {
  title: 'UI/Input/PhoneInputDisplay',
  component: PhoneInputDisplay,
  decorators: [ComponentWithRouterDecorator],
  args: {
    value: '+33788901234',
  },
};

export default meta;

type Story = StoryObj<typeof PhoneInputDisplay>;

export const Default: Story = {};
