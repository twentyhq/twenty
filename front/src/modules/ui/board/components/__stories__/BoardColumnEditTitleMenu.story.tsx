import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { BoardColumnEditTitleMenu } from '../BoardColumnEditTitleMenu';

const meta: Meta<typeof BoardColumnEditTitleMenu> = {
  title: 'UI/Accessories/Tag',
  component: BoardColumnEditTitleMenu,
};

export default meta;
type Story = StoryObj<typeof BoardColumnEditTitleMenu>;

export const AllTags: Story = {
  render: getRenderWrapperForComponent(
    <BoardColumnEditTitleMenu
      color="green"
      title={'Column title'}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClose={() => {}}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onTitleEdit={() => {}}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onColumnColorEdit={() => {}}
    />,
  ),
};
