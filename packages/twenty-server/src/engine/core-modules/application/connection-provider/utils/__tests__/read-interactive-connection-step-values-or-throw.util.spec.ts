import { readInteractiveConnectionStepValuesOrThrow } from 'src/engine/core-modules/application/connection-provider/utils/read-interactive-connection-step-values-or-throw.util';

const formSession = {
  screenType: 'form' as const,
  fieldKeys: ['email', 'password'],
  submitCount: 0,
};

describe('readInteractiveConnectionStepValuesOrThrow', () => {
  it('returns the values the form asked for', () => {
    expect(
      readInteractiveConnectionStepValuesOrThrow({
        action: 'submit',
        session: formSession,
        values: { email: 'marie@acme.com', password: 'secret' },
      }),
    ).toEqual({ email: 'marie@acme.com', password: 'secret' });
  });

  it('ignores values on a poll', () => {
    expect(
      readInteractiveConnectionStepValuesOrThrow({
        action: 'poll',
        session: { ...formSession, screenType: 'waiting', fieldKeys: [] },
        values: { email: 'marie@acme.com' },
      }),
    ).toEqual({});
  });

  it.each([
    ['a value the form did not ask for', { token: 'abc' }],
    ['a non-string value', { email: 42 }],
    ['an oversized value', { email: 'x'.repeat(4097) }],
  ])('rejects %s', (_label, values) => {
    expect(() =>
      readInteractiveConnectionStepValuesOrThrow({
        action: 'submit',
        session: formSession,
        values,
      }),
    ).toThrow('Submitted values do not match the fields of the current screen');
  });

  it('rejects a submit on a waiting screen', () => {
    expect(() =>
      readInteractiveConnectionStepValuesOrThrow({
        action: 'submit',
        session: { ...formSession, screenType: 'waiting' },
        values: {},
      }),
    ).toThrow('Cannot submit on a waiting screen');
  });

  it('rejects a poll on a form screen', () => {
    expect(() =>
      readInteractiveConnectionStepValuesOrThrow({
        action: 'poll',
        session: formSession,
        values: {},
      }),
    ).toThrow('Cannot poll on a form screen');
  });

  it('rejects a submit past the submit limit', () => {
    expect(() =>
      readInteractiveConnectionStepValuesOrThrow({
        action: 'submit',
        session: { ...formSession, submitCount: 30 },
        values: {},
      }),
    ).toThrow('Interactive connection flow reached its submit limit');
  });
});
