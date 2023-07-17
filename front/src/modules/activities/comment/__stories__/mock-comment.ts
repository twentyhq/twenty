import { DateTime } from 'luxon';

import { CommentForDrawer } from '@/activities/types/CommentForDrawer';
import { mockedUsersData } from '~/testing/mock-data/users';

const mockUser = mockedUsersData[0];

export const mockComment: Pick<
  CommentForDrawer,
  'id' | 'author' | 'createdAt' | 'body' | 'updatedAt'
> = {
  id: 'fake_comment_1_uuid',
  body: 'Hello, this is a comment.',
  author: {
    id: 'fake_comment_1_author_uuid',
    displayName: mockUser.displayName ?? '',
    firstName: mockUser.firstName ?? '',
    lastName: mockUser.lastName ?? '',
    avatarUrl: mockUser.avatarUrl,
  },
  createdAt: DateTime.fromFormat('2021-03-12', 'yyyy-MM-dd').toISO() ?? '',
  updatedAt: DateTime.fromFormat('2021-03-13', 'yyyy-MM-dd').toISO() ?? '',
};

export const mockCommentWithLongValues: Pick<
  CommentForDrawer,
  'id' | 'author' | 'createdAt' | 'body' | 'updatedAt'
> = {
  id: 'fake_comment_2_uuid',
  body: 'Hello, this is a comment. Hello, this is a comment. Hello, this is a comment. Hello, this is a comment. Hello, this is a comment. Hello, this is a comment.',
  author: {
    id: 'fake_comment_2_author_uuid',
    displayName: mockUser.displayName + ' with a very long suffix' ?? '',
    firstName: mockUser.firstName ?? '',
    lastName: mockUser.lastName ?? '',
    avatarUrl: mockUser.avatarUrl,
  },
  createdAt: DateTime.fromFormat('2021-03-12', 'yyyy-MM-dd').toISO() ?? '',
  updatedAt: DateTime.fromFormat('2021-03-13', 'yyyy-MM-dd').toISO() ?? '',
};
