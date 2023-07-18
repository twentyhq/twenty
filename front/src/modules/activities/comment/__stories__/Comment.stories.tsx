import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Comment } from '../Comment';

import { mockComment, mockCommentWithLongValues } from './mock-comment';

const meta: Meta<typeof Comment> = {
  title: 'Modules/Activity/Comment/Comment',
  component: Comment,
};

export default meta;
type Story = StoryObj<typeof Comment>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<Comment comment={mockComment} />),
};

export const WithLongValues: Story = {
  render: getRenderWrapperForComponent(
    <Comment comment={mockCommentWithLongValues} />,
  ),
};
