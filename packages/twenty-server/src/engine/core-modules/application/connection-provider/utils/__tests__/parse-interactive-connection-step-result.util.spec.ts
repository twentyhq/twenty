import { parseInteractiveConnectionStepResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-interactive-connection-step-result.util';

const credentialsForm = {
  type: 'form',
  title: 'Sign in to LinkedIn',
  fields: [
    { key: 'email', label: 'Email', kind: 'email' },
    { key: 'password', label: 'Password', kind: 'password' },
  ],
};

describe('parseInteractiveConnectionStepResult', () => {
  it('accepts a form screen with its state', () => {
    expect(
      parseInteractiveConnectionStepResult({
        type: 'screen',
        screen: credentialsForm,
        state: { step: 'credentials' },
      }),
    ).toEqual({
      isValid: true,
      stepResult: {
        type: 'screen',
        screen: credentialsForm,
        state: { step: 'credentials' },
      },
    });
  });

  it('clamps the poll interval of a waiting screen', () => {
    expect(
      parseInteractiveConnectionStepResult({
        type: 'screen',
        screen: { type: 'waiting', title: 'Approve', pollIntervalSeconds: 0 },
        state: {},
      }),
    ).toEqual({
      isValid: true,
      stepResult: {
        type: 'screen',
        screen: { type: 'waiting', title: 'Approve', pollIntervalSeconds: 2 },
        state: {},
      },
    });
  });

  it('accepts a done result', () => {
    expect(
      parseInteractiveConnectionStepResult({
        type: 'done',
        externalAccountId: ' account-1 ',
        handle: 'Marie',
      }),
    ).toEqual({
      isValid: true,
      stepResult: {
        type: 'done',
        externalAccountId: 'account-1',
        handle: 'Marie',
      },
    });
  });

  it('accepts a cancelled result', () => {
    expect(parseInteractiveConnectionStepResult({ type: 'cancelled' })).toEqual(
      { isValid: true, stepResult: { type: 'cancelled' } },
    );
  });

  it.each([
    ['a missing result', undefined],
    ['an unknown result type', { type: 'redirect', url: 'https://a.b' }],
    ['a screen without state', { type: 'screen', screen: credentialsForm }],
    [
      'a form without fields',
      { type: 'screen', screen: { ...credentialsForm, fields: [] }, state: {} },
    ],
    [
      'duplicate field keys',
      {
        type: 'screen',
        screen: {
          ...credentialsForm,
          fields: [
            { key: 'code', label: 'Code', kind: 'code' },
            { key: 'code', label: 'Code again', kind: 'code' },
          ],
        },
        state: {},
      },
    ],
    [
      'a prefilled password',
      {
        type: 'screen',
        screen: {
          ...credentialsForm,
          fields: [
            {
              key: 'password',
              label: 'Password',
              kind: 'password',
              defaultValue: 'secret',
            },
          ],
        },
        state: {},
      },
    ],
    [
      'an oversized state',
      {
        type: 'screen',
        screen: credentialsForm,
        state: { blob: 'x'.repeat(17 * 1024) },
      },
    ],
    ['a done result without account', { type: 'done' }],
  ])('rejects %s', (_label, data) => {
    expect(parseInteractiveConnectionStepResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
