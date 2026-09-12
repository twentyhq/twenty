import { canonicalizeEmailFilter } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/canonicalize-email-filter.util';

describe('canonicalizeEmailFilter', () => {
  it('canonicalizes an exact email filter', () => {
    expect(canonicalizeEmailFilter({ eq: 'Admin@💩.la' })).toEqual({
      in: ['admin@💩.la', 'admin@xn--ls8h.la'],
    });
  });

  it('canonicalizes every email in a bulk exact filter', () => {
    expect(
      canonicalizeEmailFilter({
        in: [
          'Admin@EXAMPLE.COM',
          'user@münchen.de',
          'user@пример.рф',
          'user@例え.テスト',
          'user@مثال.إختبار',
          'admin@💩.la',
        ],
      }),
    ).toEqual({
      in: [
        'admin@example.com',
        'user@münchen.de',
        'user@xn--mnchen-3ya.de',
        'user@пример.рф',
        'user@xn--e1afmkfd.xn--p1ai',
        'user@例え.テスト',
        'user@xn--r8jz45g.xn--zckzah',
        'user@مثال.إختبار',
        'user@xn--mgbh0fb.xn--kgbechtv',
        'admin@💩.la',
        'admin@xn--ls8h.la',
      ],
    });
  });

  it('does not rewrite partial-match filters', () => {
    const filter = { ilike: '%💩.la%' };

    expect(canonicalizeEmailFilter(filter)).toBe(filter);
  });
});
