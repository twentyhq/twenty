import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ActivityActionBar } from '../../right-drawer/components/ActivityActionBar';
import { Comment } from '../Comment';

import { mockComment, mockCommentWithLongValues } from './mock-comment';

const CommentSetterEffect = () => {
  const setViewableActivity = useSetRecoilState(viewableActivityIdState);

  useEffect(() => {
    setViewableActivity('test-id');
  }, [setViewableActivity]);

  return null;
};

const meta: Meta<typeof Comment> = {
  title: 'Modules/Activity/Comment/Comment',
  component: Comment,
  decorators: [
    (Story) => (
      <>
        <CommentSetterEffect />
        <Story />
      </>
    ),
    ComponentDecorator,
  ],
  argTypes: {
    actionBar: {
      type: 'boolean',
      mapping: {
        true: <ActivityActionBar />,
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
