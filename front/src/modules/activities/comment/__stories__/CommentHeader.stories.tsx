import type { Meta, StoryObj } from '@storybook/react';

import { CommentThreadActionBar } from '@/activities/right-drawer/components/CommentThreadActionBar';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommentHeader } from '../CommentHeader';

import { mockComment, mockCommentWithLongValues } from './mock-comment';

const meta: Meta<typeof CommentHeader> = {
  title: 'Modules/Activity/Comment/CommentHeader',
  component: CommentHeader,
};

export default meta;
type Story = StoryObj<typeof CommentHeader>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<CommentHeader comment={mockComment} />),
};

export const FewDaysAgo: Story = {
  render: getRenderWrapperForComponent(<CommentHeader comment={mockComment} />),
};

export const FewMonthsAgo: Story = {
  render: getRenderWrapperForComponent(<CommentHeader comment={mockComment} />),
};

export const FewYearsAgo: Story = {
  render: getRenderWrapperForComponent(<CommentHeader comment={mockComment} />),
};

export const WithoutAvatar: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        author: {
          ...mockComment.author,
          avatarUrl: '',
        },
      }}
    />,
  ),
};

export const WithLongUserName: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockCommentWithLongValues,
        author: {
          ...mockCommentWithLongValues.author,
          avatarUrl: '',
        },
      }}
    />,
  ),
};

export const WithActionBar: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={mockComment}
      actionBar={<CommentThreadActionBar commentThreadId="test-id" />}
    />,
  ),
};
