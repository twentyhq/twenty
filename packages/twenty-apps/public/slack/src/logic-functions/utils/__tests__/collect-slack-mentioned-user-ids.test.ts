import { describe, expect, it } from 'vitest';

import { collectSlackMentionedUserIds } from 'src/logic-functions/utils/collect-slack-mentioned-user-ids';

describe('collectSlackMentionedUserIds', () => {
  it('should collect every mentioned user id once across texts', () => {
    expect(
      collectSlackMentionedUserIds([
        'create a task for <@U04ABC> and <@U05DEF>',
        '<@U04ABC>: on it',
      ]),
    ).toEqual(['U04ABC', 'U05DEF']);
  });

  it('should collect a mention that carries a display label', () => {
    expect(collectSlackMentionedUserIds(['ping <@U04ABC|alice>'])).toEqual([
      'U04ABC',
    ]);
  });

  it('should not collect channel or user group references', () => {
    expect(
      collectSlackMentionedUserIds(['<#C0GEN|general> <!subteam^S01|@sales>']),
    ).toEqual([]);
  });
});
