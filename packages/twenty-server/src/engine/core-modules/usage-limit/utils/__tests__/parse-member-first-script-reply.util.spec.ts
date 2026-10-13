import { parseMemberFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-member-first-script-reply.util';

describe('parseMemberFirstScriptReply', () => {
  it('reads an applied split', () => {
    expect(parseMemberFirstScriptReply([1_000, 200, 100])).toEqual({
      memberConsumed: 1_000,
      allowanceConsumed: 200,
      memberShare: 100,
    });
  });

  it('reads a deferral and which key is cold', () => {
    expect(parseMemberFirstScriptReply([900, null, null])).toEqual({
      memberConsumed: 900,
      allowanceConsumed: null,
      memberShare: null,
    });
    expect(parseMemberFirstScriptReply([null, 200, null])).toEqual({
      memberConsumed: null,
      allowanceConsumed: 200,
      memberShare: null,
    });
  });

  it('maps a missing entry to null', () => {
    expect(parseMemberFirstScriptReply([null])).toEqual({
      memberConsumed: null,
      allowanceConsumed: null,
      memberShare: null,
    });
  });

  it('refuses a reply that is not an array', () => {
    expect(() => parseMemberFirstScriptReply('OK')).toThrow(
      'Member-first script reply is not an array',
    );
  });

  it('refuses a member share without the member counter it was added to', () => {
    expect(() => parseMemberFirstScriptReply([null, 200, 100])).toThrow(
      'Member-first script reply has a member share without a member counter value',
    );
  });
});
