import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  COLUMN_COLOR_OPTIONS,
  RecordBoardColumnEditTitleMenu,
} from '../RecordBoardColumnEditTitleMenu';

const meta: Meta<typeof RecordBoardColumnEditTitleMenu> = {
  title: 'UI/Layout/Board/BoardColumnMenu',
  component: RecordBoardColumnEditTitleMenu,
  decorators: [ComponentDecorator],
  argTypes: {
    color: {
      control: 'select',
      options: COLUMN_COLOR_OPTIONS.map(({ id }) => id),
    },
  },
  args: { color: 'green', title: 'Column title' },
};

export default meta;
type Story = StoryObj<typeof RecordBoardColumnEditTitleMenu>;

export const AllTags: Story = {};
