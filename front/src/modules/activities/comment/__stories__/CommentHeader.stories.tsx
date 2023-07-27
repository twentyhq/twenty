import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from 'luxon';

import { CommentThreadActionBar } from '@/activities/right-drawer/components/CommentThreadActionBar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { avatarUrl } from '~/testing/mock-data/users';

import { CommentHeader } from '../CommentHeader';

import { mockComment, mockCommentWithLongValues } from './mock-comment';

const meta: Meta<typeof CommentHeader> = {
  title: 'Modules/Activity/Comment/CommentHeader',
  component: CommentHeader,
  decorators: [ComponentDecorator],
  argTypes: {
    actionBar: {
      type: 'boolean',
      mapping: {
        true: <CommentThreadActionBar commentThreadId="test-id" />,
        false: undefined,
      },
    },
  },
  args: { comment: mockComment },
};

export default meta;
type Story = StoryObj<typeof CommentHeader>;

export const Default: Story = {};

export const FewHoursAgo: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: DateTime.now().minus({ hours: 2 }).toISO() ?? '',
    },
  },
};

export const FewDaysAgo: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: DateTime.now().minus({ days: 2 }).toISO() ?? '',
    },
  },
};

export const FewMonthsAgo: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: DateTime.now().minus({ months: 2 }).toISO() ?? '',
    },
  },
};

export const FewYearsAgo: Story = {
  args: {
    comment: {
      ...mockComment,
      createdAt: DateTime.now().minus({ years: 2 }).toISO() ?? '',
    },
  },
};

export const WithAvatar: Story = {
  args: {
    comment: {
      ...mockComment,
      author: {
        ...mockComment.author,
        avatarUrl,
      },
    },
  },
};

export const WithLongUserName: Story = {
  args: { comment: mockCommentWithLongValues },
};

export const WithActionBar: Story = {
  args: { actionBar: true },
};
