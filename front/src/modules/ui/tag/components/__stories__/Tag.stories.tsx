import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Tag } from '../Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Accessories/Tag',
  component: Tag,
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
  render: getRenderWrapperForComponent(
    <>
      {TESTED_COLORS.map((colorCode) => (
        <Tag text="Urgent" colorCode={colorCode} />
      ))}
    </>,
  ),
};
