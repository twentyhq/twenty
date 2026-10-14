import { parseUserAllowanceFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-user-allowance-first-script-reply.util';

describe('parseUserAllowanceFirstScriptReply', () => {
  it('reads an applied split', () => {
    expect(parseUserAllowanceFirstScriptReply([1_000, 200, 100])).toEqual({
      userAllowanceConsumed: 1_000,
      workspaceAllowanceConsumed: 200,
      userShare: 100,
    });
  });

  it('reads a deferral and which key is cold', () => {
    expect(parseUserAllowanceFirstScriptReply([900, null, null])).toEqual({
      userAllowanceConsumed: 900,
      workspaceAllowanceConsumed: null,
      userShare: null,
    });
    expect(parseUserAllowanceFirstScriptReply([null, 200, null])).toEqual({
      userAllowanceConsumed: null,
      workspaceAllowanceConsumed: 200,
      userShare: null,
    });
  });

  it('maps a missing entry to null', () => {
    expect(parseUserAllowanceFirstScriptReply([null])).toEqual({
      userAllowanceConsumed: null,
      workspaceAllowanceConsumed: null,
      userShare: null,
    });
  });

  it('refuses a reply that is not an array', () => {
    expect(() => parseUserAllowanceFirstScriptReply('OK')).toThrow(
      'User-allowance-first script reply is not an array',
    );
  });

  it('refuses a user share without the user allowance counter it was added to', () => {
    expect(() => parseUserAllowanceFirstScriptReply([null, 200, 100])).toThrow(
      'User-allowance-first script reply has a user share without a user allowance counter value',
    );
  });
});
