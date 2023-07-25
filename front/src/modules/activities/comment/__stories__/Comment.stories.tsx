import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { CommentThreadActionBar } from '../../right-drawer/components/CommentThreadActionBar';
import { Comment } from '../Comment';

import { mockComment, mockCommentWithLongValues } from './mock-comment';

const meta: Meta<typeof Comment> = {
  title: 'Modules/Activity/Comment/Comment',
  component: Comment,
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
type Story = StoryObj<typeof Comment>;

export const Default: Story = {};

export const WithLongValues: Story = {
  args: { comment: mockCommentWithLongValues },
};
