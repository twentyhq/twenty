import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from 'luxon';

import { CommentThreadActionBar } from '@/activities/right-drawer/components/CommentThreadActionBar';
import { CommentForDrawer } from '@/activities/types/CommentForDrawer';
import { mockedUsersData } from '~/testing/mock-data/users';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommentHeader } from '../CommentHeader';

const meta: Meta<typeof CommentHeader> = {
  title: 'Modules/Comments/CommentHeader',
  component: CommentHeader,
};

export default meta;
type Story = StoryObj<typeof CommentHeader>;

const mockUser = mockedUsersData[0];

const mockComment: Pick<CommentForDrawer, 'id' | 'author' | 'createdAt'> = {
  id: 'fake_comment_1_uuid',
  author: {
    id: 'fake_comment_1_author_uuid',
    displayName: mockUser.displayName ?? '',
    firstName: mockUser.firstName ?? '',
    lastName: mockUser.lastName ?? '',
    avatarUrl: mockUser.avatarUrl,
  },
  createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
};

const mockCommentWithLongName: Pick<
  CommentForDrawer,
  'id' | 'author' | 'createdAt'
> = {
  id: 'fake_comment_2_uuid',
  author: {
    id: 'fake_comment_2_author_uuid',
    displayName: mockUser.displayName + ' with a very long suffix' ?? '',
    firstName: mockUser.firstName ?? '',
    lastName: mockUser.lastName ?? '',
    avatarUrl: mockUser.avatarUrl,
  },
  createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
};

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
      }}
    />,
  ),
};

export const FewDaysAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        createdAt: DateTime.now().minus({ days: 2 }).toISO() ?? '',
      }}
    />,
  ),
};

export const FewMonthsAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        createdAt: DateTime.now().minus({ months: 2 }).toISO() ?? '',
      }}
    />,
  ),
};

export const FewYearsAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        createdAt: DateTime.now().minus({ years: 2 }).toISO() ?? '',
      }}
    />,
  ),
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
        createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
      }}
    />,
  ),
};

export const WithLongUserName: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockCommentWithLongName,
        author: {
          ...mockCommentWithLongName.author,
          avatarUrl: '',
        },
        createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
      }}
    />,
  ),
};

export const WithActionBar: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      comment={{
        ...mockComment,
        createdAt: DateTime.now().minus({ days: 2 }).toISO() ?? '',
      }}
      actionBar={<CommentThreadActionBar commentThreadId="test-id" />}
    />,
  ),
};
