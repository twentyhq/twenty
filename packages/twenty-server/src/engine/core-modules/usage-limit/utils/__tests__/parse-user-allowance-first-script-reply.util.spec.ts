import { parseUserAllowanceFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-user-allowance-first-script-reply.util';

describe('parseUserAllowanceFirstScriptReply', () => {
  it('reads an applied split across every user allowance window', () => {
    expect(
      parseUserAllowanceFirstScriptReply({
        reply: [100, 200, 1_000, 3_000],
        userAllowanceCount: 2,
      }),
    ).toEqual({
      userShare: 100,
      workspaceAllowanceConsumed: 200,
      userAllowanceConsumedValues: [1_000, 3_000],
    });
  });

  it('reads a deferral and which keys are cold', () => {
    expect(
      parseUserAllowanceFirstScriptReply({
        reply: [null, null, 900, null],
        userAllowanceCount: 2,
      }),
    ).toEqual({
      userShare: null,
      workspaceAllowanceConsumed: null,
      userAllowanceConsumedValues: [900, null],
    });
  });

  it('maps a missing entry to null', () => {
    expect(
      parseUserAllowanceFirstScriptReply({
        reply: [null],
        userAllowanceCount: 1,
      }),
    ).toEqual({
      userShare: null,
      workspaceAllowanceConsumed: null,
      userAllowanceConsumedValues: [null],
    });
  });

  it('refuses a reply that is not an array', () => {
    expect(() =>
      parseUserAllowanceFirstScriptReply({
        reply: 'OK',
        userAllowanceCount: 1,
      }),
    ).toThrow('User-allowance-first script reply is not an array');
  });

  it('refuses a user share without every user allowance counter it was added to', () => {
    expect(() =>
      parseUserAllowanceFirstScriptReply({
        reply: [100, 200, 1_000, null],
        userAllowanceCount: 2,
      }),
    ).toThrow(
      'User-allowance-first script reply has a user share without every user allowance counter value',
    );
  });
});
