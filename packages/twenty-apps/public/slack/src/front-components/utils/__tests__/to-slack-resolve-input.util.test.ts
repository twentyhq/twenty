import { describe, expect, it } from 'vitest';

import { toSlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';

describe('toSlackResolveInput', () => {
  it('should trim every field', () => {
    expect(
      toSlackResolveInput({
        email: '  ada@twenty.com ',
        slackUserId: ' U0123456789 ',
        slackTeamId: ' T0INSTALLED ',
      }),
    ).toEqual({
      email: 'ada@twenty.com',
      slackUserId: 'U0123456789',
      slackTeamId: 'T0INSTALLED',
    });
  });

  it('should drop whitespace-only fields as absent', () => {
    expect(
      toSlackResolveInput({
        email: '   ',
        slackUserId: '\t',
        slackTeamId: ' T0INSTALLED ',
      }),
    ).toEqual({
      email: undefined,
      slackUserId: undefined,
      slackTeamId: 'T0INSTALLED',
    });
  });

  it('should drop empty fields as absent', () => {
    expect(
      toSlackResolveInput({ email: '', slackUserId: '', slackTeamId: '' }),
    ).toEqual({
      email: undefined,
      slackUserId: undefined,
      slackTeamId: undefined,
    });
  });
});
