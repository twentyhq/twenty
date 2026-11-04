import { getAccountGroupActionFailureMessage } from '@/settings/app-preferences/utils/getAccountGroupActionFailureMessage';

const TARGETS = [
  { id: 'google', label: 'tim@apple.dev' },
  { id: 'fathom-connection', label: 'Fathom' },
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
  it('returns no message when every connection succeeds', () => {
    expect(
      getAccountGroupActionFailureMessage({
        action: 'delete',
        targets: TARGETS,
        results: [FULFILLED, FULFILLED],
      }),
    ).toBeUndefined();
  });

  it.each([
    [
      'disconnect',
      'Disconnected 1 of 2 connections. Could not disconnect: Fathom.',
    ],
    ['delete', 'Deleted 1 of 2 connections. Could not delete: Fathom.'],
  ] as const)('names the one failed connection on %s', (action, message) => {
    expect(
      getAccountGroupActionFailureMessage({
        action,
        targets: TARGETS,
        results: [FULFILLED, REJECTED],
      }),
    ).toBe(message);
  });

  it('names each failed label once', () => {
    expect(
      getAccountGroupActionFailureMessage({
        action: 'delete',
        targets: [
          ...TARGETS,
          { id: 'second-fathom-connection', label: 'Fathom' },
        ],
        results: [REJECTED, REJECTED, REJECTED],
      }),
    ).toBe(
      'Deleted 0 of 3 connections. Could not delete: tim@apple.dev, Fathom.',
    );
  });
});
