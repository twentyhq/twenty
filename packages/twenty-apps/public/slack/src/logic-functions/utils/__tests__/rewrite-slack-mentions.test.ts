import { describe, expect, it } from 'vitest';

import {
  collectSlackMentionedUserIds,
  rewriteSlackMentions,
} from 'src/logic-functions/utils/rewrite-slack-mentions';

const rewrite = (text: string, labels: Record<string, string> = {}) =>
  rewriteSlackMentions({
    text,
    userLabelBySlackUserId: new Map(Object.entries(labels)),
  });

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

describe('rewriteSlackMentions', () => {
  it('should substitute a mention with its resolved label', () => {
    expect(
      rewrite('create a follow-up task for <@U04ABC>', {
        U04ABC: '@Alice Martin (workspace member member-1)',
      }),
    ).toBe(
      'create a follow-up task for @Alice Martin (workspace member member-1)',
    );
  });

  it('should substitute several mentions in one message', () => {
    expect(
      rewrite('is it <@U04ABC> or <@U05DEF> who owns Acme?', {
        U04ABC: '@Alice Martin (workspace member member-1)',
        U05DEF: '@Bob Lee (no Twenty workspace member)',
      }),
    ).toBe(
      'is it @Alice Martin (workspace member member-1) or @Bob Lee (no Twenty workspace member) who owns Acme?',
    );
  });

  it('should substitute a labelled mention using the resolved label, not the Slack label', () => {
    expect(
      rewrite('ping <@U04ABC|alice.m>', {
        U04ABC: '@Alice Martin (workspace member member-1)',
      }),
    ).toBe('ping @Alice Martin (workspace member member-1)');
  });

  it('should leave a mention untouched when no label was resolved for it', () => {
    expect(rewrite('ping <@U04ABC>')).toBe('ping <@U04ABC>');
  });

  it('should name a channel reference by its channel name', () => {
    expect(rewrite('posted in <#C0GEN|general>')).toBe('posted in #general');
  });

  it('should fall back to the channel id when the reference carries no name', () => {
    expect(rewrite('posted in <#C0GEN>')).toBe('posted in #C0GEN');
  });

  it('should name a user group by its handle', () => {
    expect(rewrite('ask <!subteam^S01|@sales>')).toBe('ask @sales');
    expect(rewrite('ask <!subteam^S01|sales>')).toBe('ask @sales');
  });

  it('should fall back to the user group id when the reference carries no handle', () => {
    expect(rewrite('ask <!subteam^S01>')).toBe('ask @user-group S01');
  });

  it('should rewrite broadcast mentions', () => {
    expect(rewrite('<!here> <!channel> <!everyone|@everyone>')).toBe(
      '@here @channel @everyone',
    );
  });

  it('should leave Slack link syntax untouched', () => {
    expect(rewrite('see <https://acme.com|the deal> for <@U04ABC>')).toBe(
      'see <https://acme.com|the deal> for <@U04ABC>',
    );
  });
});
