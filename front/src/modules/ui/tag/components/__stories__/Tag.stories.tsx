import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators';

import { Tag } from '../Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Accessories/Tag',
  component: Tag,
  decorators: [ComponentDecorator],
  argTypes: { color: { control: false } },
  args: { text: 'Urgent' },
};

export default meta;
type Story = StoryObj<typeof Tag>;

const TESTED_COLORS = [
  'green',
  'turquoise',
  'sky',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'gray',
];

export const AllTags: Story = {
  render: (args) => (
    <>
      {TESTED_COLORS.map((color) => (
        <Tag {...args} color={color} />
      ))}
    </>
  ),
};
