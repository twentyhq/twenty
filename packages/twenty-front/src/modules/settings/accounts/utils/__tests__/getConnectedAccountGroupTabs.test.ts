import { getConnectedAccountGroupTabs } from '@/settings/accounts/utils/getConnectedAccountGroupTabs';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';

describe('getConnectedAccountGroupTabs', () => {
  it('uses actual channel and application bindings, preserving exact shared and owned IDs', () => {
    const tabs = getConnectedAccountGroupTabs({
      accounts: [
        {
          id: 'google-own',
          provider: ConnectedAccountProvider.GOOGLE,
          applicationId: null,
        },
        {
          id: 'google-shared',
          provider: ConnectedAccountProvider.GOOGLE,
          applicationId: null,
        },
        {
          id: 'fathom',
          provider: ConnectedAccountProvider.APP,
          applicationId: 'fathom-app',
        },
        {
          id: 'fathom-second',
          provider: ConnectedAccountProvider.APP,
          applicationId: 'fathom-app',
        },
      ],
      messageChannels: [
        {
          id: 'email-own',
          connectedAccountId: 'google-own',
          type: MessageChannelType.EMAIL,
        },
        {
          id: 'email-shared',
          connectedAccountId: 'google-shared',
          type: MessageChannelType.EMAIL,
        },
        {
          id: 'unrelated',
          connectedAccountId: 'other-email',
          type: MessageChannelType.EMAIL,
        },
      ],
      calendarChannels: [{ id: 'calendar', connectedAccountId: 'google-own' }],
    });

    expect(tabs).toEqual([
      {
        id: 'email-google',
        type: 'email',
        provider: ConnectedAccountProvider.GOOGLE,
        connectedAccountIds: ['google-own', 'google-shared'],
        channelIds: ['email-own', 'email-shared'],
      },
      {
        id: 'calendar-google',
        type: 'calendar',
        provider: ConnectedAccountProvider.GOOGLE,
        connectedAccountIds: ['google-own'],
        channelIds: ['calendar'],
      },
      {
        id: 'app-fathom-app',
        type: 'app',
        applicationId: 'fathom-app',
        connectedAccountIds: ['fathom', 'fathom-second'],
      },
    ]);
  });

  it('keeps calendar-only and unavailable bindings honest without inferring usage from the provider', () => {
    expect(
      getConnectedAccountGroupTabs({
        accounts: [
          {
            id: 'calendar-only',
            provider: ConnectedAccountProvider.MICROSOFT,
            applicationId: null,
          },
          {
            id: 'not-configured',
            provider: ConnectedAccountProvider.GOOGLE,
            applicationId: null,
          },
          {
            id: 'orphan-app',
            provider: ConnectedAccountProvider.APP,
            applicationId: null,
          },
        ],
        messageChannels: [],
        calendarChannels: [
          { id: 'paused-calendar', connectedAccountId: 'calendar-only' },
        ],
      }),
    ).toEqual([
      {
        id: 'calendar-microsoft',
        type: 'calendar',
        provider: ConnectedAccountProvider.MICROSOFT,
        connectedAccountIds: ['calendar-only'],
        channelIds: ['paused-calendar'],
      },
      {
        id: 'connection',
        type: 'connection',
        connectedAccountIds: ['not-configured', 'orphan-app'],
      },
    ]);
  });

  it('does not call a Google email-group channel Gmail', () => {
    expect(
      getConnectedAccountGroupTabs({
        accounts: [
          {
            id: 'google',
            provider: ConnectedAccountProvider.GOOGLE,
            applicationId: null,
          },
          {
            id: 'group',
            provider: ConnectedAccountProvider.EMAIL_GROUP,
            applicationId: null,
          },
        ],
        messageChannels: [
          {
            id: 'google-group',
            connectedAccountId: 'google',
            type: MessageChannelType.EMAIL_GROUP,
          },
          {
            id: 'group-mail',
            connectedAccountId: 'group',
            type: MessageChannelType.EMAIL_GROUP,
          },
        ],
        calendarChannels: [],
      }),
    ).toEqual([
      {
        id: 'email-email_group',
        type: 'email',
        provider: ConnectedAccountProvider.EMAIL_GROUP,
        connectedAccountIds: ['group'],
        channelIds: ['group-mail'],
      },
      { id: 'connection', type: 'connection', connectedAccountIds: ['google'] },
    ]);
  });
});
