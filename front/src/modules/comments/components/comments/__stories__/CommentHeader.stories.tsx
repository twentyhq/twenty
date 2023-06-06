import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from 'luxon';

import { mockedUsersData } from '~/testing/mock-data/users';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommentHeader } from '../CommentHeader';

const meta: Meta<typeof CommentHeader> = {
  title: 'Components/Comments/CommentHeader',
  component: CommentHeader,
};

export default meta;
type Story = StoryObj<typeof CommentHeader>;

const mockUser = mockedUsersData[0];

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      avatarUrl={mockUser.avatarUrl ?? ''}
      username={mockUser.displayName ?? ''}
      createdAt={DateTime.now().minus({ hours: 2 }).toJSDate()}
    />,
  ),
};

export const FewDaysAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      avatarUrl={mockUser.avatarUrl ?? ''}
      username={mockUser.displayName ?? ''}
      createdAt={DateTime.now().minus({ days: 2 }).toJSDate()}
    />,
  ),
};

export const FewMonthsAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      avatarUrl={mockUser.avatarUrl ?? ''}
      username={mockUser.displayName ?? ''}
      createdAt={DateTime.now().minus({ months: 2 }).toJSDate()}
    />,
  ),
};

export const FewYearsAgo: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      avatarUrl={mockUser.avatarUrl ?? ''}
      username={mockUser.displayName ?? ''}
      createdAt={DateTime.now().minus({ years: 2 }).toJSDate()}
    />,
  ),
};

export const WithoutAvatar: Story = {
  render: getRenderWrapperForComponent(
    <CommentHeader
      avatarUrl={''}
      username={mockUser.displayName ?? ''}
      createdAt={DateTime.now().minus({ hours: 2 }).toJSDate()}
    />,
  ),
};
