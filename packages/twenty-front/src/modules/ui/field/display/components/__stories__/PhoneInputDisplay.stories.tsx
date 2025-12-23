import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay'; // Adjust the import path as needed

const meta: Meta = {
  title: 'UI/Input/PhoneInputDisplay/PhoneInputDisplay',
  component: PhoneDisplay,
  decorators: [ComponentWithRouterDecorator],
  args: {
    value: '+33788901234',
  },
};

export default meta;

type Story = StoryObj<typeof PhoneDisplay>;

export const Default: Story = {};
