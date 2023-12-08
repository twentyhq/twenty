import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { RecordBoardColumnEditTitleMenu } from '../RecordBoardColumnEditTitleMenu';

const meta: Meta<typeof RecordBoardColumnEditTitleMenu> = {
  title: 'UI/Layout/Board/BoardColumnMenu',
  component: RecordBoardColumnEditTitleMenu,
  decorators: [ComponentDecorator],
  args: { color: 'green', title: 'Column title' },
};

export default meta;
type Story = StoryObj<typeof RecordBoardColumnEditTitleMenu>;

export const AllTags: Story = {};
