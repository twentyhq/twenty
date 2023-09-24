import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ActivityActionBar } from '../../right-drawer/components/ActivityActionBar';
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
        true: <ActivityActionBar activityId="test-id" />,
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
