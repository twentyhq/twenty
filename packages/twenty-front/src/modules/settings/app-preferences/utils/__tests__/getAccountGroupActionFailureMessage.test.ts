import { getAccountGroupActionFailureMessage } from '@/settings/app-preferences/utils/getAccountGroupActionFailureMessage';

const TARGETS = [
  { id: 'google', label: 'Gmail and Calendar' },
  { id: 'linear', label: 'Linear: Shared workspace' },
];

const FULFILLED: PromiseSettledResult<unknown> = {
  status: 'fulfilled',
  value: undefined,
};
const REJECTED: PromiseSettledResult<unknown> = {
  status: 'rejected',
  reason: new Error('Mutation failed'),
};

describe('getAccountGroupActionFailureMessage', () => {
  it.each(['disconnect', 'delete'] as const)(
    'returns no message when every %s succeeds',
    (action) => {
      expect(
        getAccountGroupActionFailureMessage({
          action,
          targets: TARGETS,
          results: [FULFILLED, FULFILLED],
        }),
      ).toBeUndefined();
    },
  );

  it.each([
    [
      'disconnect',
      'Disconnected 1 of 2 connections. Could not disconnect: Linear: Shared workspace.',
    ],
    [
      'delete',
      'Deleted 1 of 2 connections. Could not delete: Linear: Shared workspace.',
    ],
  ] as const)('names the one failed connection on %s', (action, message) => {
    expect(
      getAccountGroupActionFailureMessage({
        action,
        targets: TARGETS,
        results: [FULFILLED, REJECTED],
      }),
    ).toBe(message);
  });

  it.each([
    [
      'disconnect',
      'Disconnected 0 of 2 connections. Could not disconnect: Gmail and Calendar, Linear: Shared workspace.',
    ],
    [
      'delete',
      'Deleted 0 of 2 connections. Could not delete: Gmail and Calendar, Linear: Shared workspace.',
    ],
  ] as const)('names every failed connection on %s', (action, message) => {
    expect(
      getAccountGroupActionFailureMessage({
        action,
        targets: TARGETS,
        results: [REJECTED, REJECTED],
      }),
    ).toBe(message);
  });
});
