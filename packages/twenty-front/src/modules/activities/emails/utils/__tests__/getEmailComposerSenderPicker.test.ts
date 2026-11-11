import { getEmailComposerSenderPicker } from '@/activities/emails/utils/getEmailComposerSenderPicker';

const SENDABLE_ACCOUNTS = [
  { id: 'gmail-account', handle: 'jane@gmail.com', handleAliases: null },
  { id: 'work-account', handle: 'jane@work.com', handleAliases: null },
];

const APP_SENDER = {
  connectedAccountId: 'app-account',
  handle: 'jane@outlook.com',
};

describe('getEmailComposerSenderPicker', () => {
  it('offers the app sender and selects it when the reply goes through the app', () => {
    const { options, selectedValue } = getEmailComposerSenderPicker({
      sendableAccounts: SENDABLE_ACCOUNTS,
      appSender: APP_SENDER,
      sender: { connectedAccountId: 'app-account' },
    });

    expect(options.map((option) => option.label)).toEqual([
      'jane@outlook.com',
      'jane@gmail.com',
      'jane@work.com',
    ]);
    expect(selectedValue).toBe('app-account');
  });

  it('moves the selection to the native mailbox picked instead of the app', () => {
    const { getSenderForValue } = getEmailComposerSenderPicker({
      sendableAccounts: SENDABLE_ACCOUNTS,
      appSender: APP_SENDER,
      sender: { connectedAccountId: 'app-account' },
    });

    expect(getSenderForValue('jane@work.com')).toEqual({
      connectedAccountId: 'work-account',
      fromHandle: 'jane@work.com',
    });

    const { selectedValue } = getEmailComposerSenderPicker({
      sendableAccounts: SENDABLE_ACCOUNTS,
      appSender: APP_SENDER,
      sender: {
        connectedAccountId: 'work-account',
        fromHandle: 'jane@work.com',
      },
    });

    expect(selectedValue).toBe('jane@work.com');
  });

  it('switches back to the app sender', () => {
    const { getSenderForValue } = getEmailComposerSenderPicker({
      sendableAccounts: SENDABLE_ACCOUNTS,
      appSender: APP_SENDER,
      sender: {
        connectedAccountId: 'work-account',
        fromHandle: 'jane@work.com',
      },
    });

    expect(getSenderForValue('app-account')).toEqual({
      connectedAccountId: 'app-account',
    });
  });

  it('keeps the app option apart from a native mailbox with the same handle', () => {
    const { options, getSenderForValue } = getEmailComposerSenderPicker({
      sendableAccounts: [
        {
          id: 'outlook-account',
          handle: 'jane@outlook.com',
          handleAliases: null,
        },
      ],
      appSender: APP_SENDER,
      sender: { connectedAccountId: 'app-account' },
    });

    expect(options).toHaveLength(2);
    expect(getSenderForValue('jane@outlook.com')).toEqual({
      connectedAccountId: 'outlook-account',
      fromHandle: 'jane@outlook.com',
    });
  });

  it('lists only native mailboxes outside app replies', () => {
    const { options, selectedValue } = getEmailComposerSenderPicker({
      sendableAccounts: SENDABLE_ACCOUNTS,
      sender: { connectedAccountId: 'gmail-account' },
    });

    expect(options.map((option) => option.value)).toEqual([
      'jane@gmail.com',
      'jane@work.com',
    ]);
    expect(selectedValue).toBe('jane@gmail.com');
  });
});
