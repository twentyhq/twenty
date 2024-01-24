import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { RecordBoardDeprecatedColumnEditTitleMenu } from '../RecordBoardDeprecatedColumnEditTitleMenu';

const meta: Meta<typeof RecordBoardDeprecatedColumnEditTitleMenu> = {
  title: 'UI/Layout/Board/BoardColumnMenu',
  component: RecordBoardDeprecatedColumnEditTitleMenu,
  decorators: [ComponentDecorator],
  args: { color: 'green', title: 'Column title' },
};

export default meta;
type Story = StoryObj<typeof RecordBoardDeprecatedColumnEditTitleMenu>;

export const AllTags: Story = {};
