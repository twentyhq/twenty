import { canonicalizeEmailsFilterValue } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/canonicalize-emails-filter-value.util';

describe('canonicalizeEmailsFilterValue', () => {
  it('canonicalizes exact equality without changing SQL operator semantics', () => {
    expect(
      canonicalizeEmailsFilterValue({
        value: ' Admin@💩。LA. ',
        operator: 'eq',
        subFieldKey: 'primaryEmail',
      }),
    ).toBe('admin@xn--ls8h.la');
  });

  it('canonicalizes each exact membership operand', () => {
    expect(
      canonicalizeEmailsFilterValue({
        value: ['Admin@💩.LA', 'other@XN--MNCHEN-3YA.DE'],
        operator: 'in',
        subFieldKey: 'primaryEmail',
      }),
    ).toEqual(['admin@xn--ls8h.la', 'other@xn--mnchen-3ya.de']);
  });

  it('does not alter partial-text filters or other subfields', () => {
    expect(
      canonicalizeEmailsFilterValue({
        value: '%💩%',
        operator: 'ilike',
        subFieldKey: 'primaryEmail',
      }),
    ).toBe('%💩%');
    expect(
      canonicalizeEmailsFilterValue({
        value: ['Admin@💩.LA'],
        operator: 'in',
        subFieldKey: 'additionalEmails',
      }),
    ).toEqual(['Admin@💩.LA']);
  });
});
