import { canonicalizeEmailColumnsValue } from 'src/database/commands/upgrade-version-command/2-41/utils/canonicalize-email-columns-value.util';

describe('canonicalizeEmailColumnsValue', () => {
  it('canonicalizes primary and additional internationalized domains', () => {
    expect(
      canonicalizeEmailColumnsValue({
        primaryEmail: 'admin@💩.la',
        additionalEmails: ['user@例え.テスト', 'user@пример.рф'],
      }),
    ).toEqual({
      primaryEmail: 'admin@xn--ls8h.la',
      additionalEmails: [
        'user@xn--r8jz45g.xn--zckzah',
        'user@xn--e1afmkfd.xn--p1ai',
      ],
      hasChanges: true,
    });
  });

  it('leaves canonical values unchanged', () => {
    expect(
      canonicalizeEmailColumnsValue({
        primaryEmail: 'admin@example.com',
        additionalEmails: ['user@xn--mgbh0fb.xn--kgbechtv'],
      }),
    ).toEqual({
      primaryEmail: 'admin@example.com',
      additionalEmails: ['user@xn--mgbh0fb.xn--kgbechtv'],
      hasChanges: false,
    });
  });

  it('preserves malformed non-string JSON values', () => {
    expect(
      canonicalizeEmailColumnsValue({
        primaryEmail: null,
        additionalEmails: ['admin@💩.la', { legacy: true }],
      }),
    ).toEqual({
      primaryEmail: null,
      additionalEmails: ['admin@xn--ls8h.la', { legacy: true }],
      hasChanges: true,
    });
  });
});
