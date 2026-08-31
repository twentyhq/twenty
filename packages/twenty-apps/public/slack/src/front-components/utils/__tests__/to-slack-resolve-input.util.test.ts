import { describe, expect, it } from 'vitest';

import { toSlackResolveInput } from 'src/front-components/utils/to-slack-resolve-input.util';

describe('toSlackResolveInput', () => {
  it('should trim every field', () => {
    expect(
      toSlackResolveInput({
        slackUserId: ' U0123456789 ',
        slackTeamId: ' T0INSTALLED ',
      }),
    ).toEqual({
      slackUserId: 'U0123456789',
      slackTeamId: 'T0INSTALLED',
    });
  });

  it('should drop whitespace-only fields as absent', () => {
    expect(
      toSlackResolveInput({
        slackUserId: '\t',
        slackTeamId: ' T0INSTALLED ',
      }),
    ).toEqual({
      slackUserId: undefined,
      slackTeamId: 'T0INSTALLED',
    });
  });

  it('should drop empty fields as absent', () => {
    expect(toSlackResolveInput({ slackUserId: '', slackTeamId: '' })).toEqual({
      slackUserId: undefined,
      slackTeamId: undefined,
    });
  });
});
