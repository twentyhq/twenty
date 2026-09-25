import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from 'twenty-ui/testing';

import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay/JsonDisplay';

const meta: Meta<typeof JsonDisplay> = {
  title: 'UI/Data Display/JsonDisplay',
  component: JsonDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof JsonDisplay>;

export const Default: Story = {
  args: {
    text: '{ "key": "value", "count": 3 }',
    maxWidth: 200,
  },
};
