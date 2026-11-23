import { MessageChannelType } from 'twenty-shared/types';

import { isGettingStartedMailboxAccount } from '@/getting-started/utils/isGettingStartedMailboxAccount';

describe('isGettingStartedMailboxAccount', () => {
  it.each([
    {
      description: 'counts an account syncing email',
      account: {
        archivedAt: null,
        messageChannels: [{ type: MessageChannelType.EMAIL }],
        calendarChannels: [],
      },
      expected: true,
    },
    {
      description: 'counts an account syncing only its calendar',
      account: {
        archivedAt: null,
        messageChannels: [],
        calendarChannels: [{ id: 'calendar-channel' }],
      },
      expected: true,
    },
    {
      description: 'skips an account stored by an SSO sign-in, without channel',
      account: { archivedAt: null, messageChannels: [], calendarChannels: [] },
      expected: false,
    },
    {
      description: 'skips an account whose only message channel is not email',
      account: {
        archivedAt: null,
        messageChannels: [{ type: MessageChannelType.EMAIL_GROUP }],
        calendarChannels: [],
      },
      expected: false,
    },
    {
      description: 'skips an archived account',
      account: {
        archivedAt: '2026-11-01T00:00:00.000Z',
        messageChannels: [{ type: MessageChannelType.EMAIL }],
        calendarChannels: [],
      },
      expected: false,
    },
  ])('$description', ({ account, expected }) => {
    expect(isGettingStartedMailboxAccount(account)).toBe(expected);
  });
});
