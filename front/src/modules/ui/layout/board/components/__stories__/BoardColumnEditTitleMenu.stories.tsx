import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  BoardColumnEditTitleMenu,
  COLUMN_COLOR_OPTIONS,
} from '../BoardColumnEditTitleMenu';

const meta: Meta<typeof BoardColumnEditTitleMenu> = {
  title: 'UI/Board/BoardColumnMenu',
  component: BoardColumnEditTitleMenu,
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
type Story = StoryObj<typeof BoardColumnEditTitleMenu>;

export const AllTags: Story = {};
