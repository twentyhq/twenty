import { describe, expect, it } from 'vitest';

import { joinTallyAnswers } from './backfill-pre-review';

const PARTNER_A = '11111111-1111-1111-1111-111111111111';
const PARTNER_B = '22222222-2222-2222-2222-222222222222';

describe('joinTallyAnswers', () => {
  it('joins on partnerId first', () => {
    const { matched, orphans } = joinTallyAnswers({
      partners: [{ id: PARTNER_A, email: 'ada@acme.com' }],
      tallyAnswers: [{ partnerId: PARTNER_A, proofUrl: 'https://crm.acme.com' }],
    });

    expect(matched.get(PARTNER_A)?.proofUrl).toBe('https://crm.acme.com');
    expect(orphans).toEqual([]);
  });

  it('falls back to a case-insensitive email match', () => {
    const { matched, orphans } = joinTallyAnswers({
      partners: [{ id: PARTNER_B, email: 'Ada@Acme.com' }],
      tallyAnswers: [{ email: 'ada@acme.com', proofUrl: 'https://youtu.be/x' }],
    });

    expect(matched.get(PARTNER_B)?.proofUrl).toBe('https://youtu.be/x');
    expect(orphans).toEqual([]);
  });

  it('reports a row that matches nothing as an orphan', () => {
    const { matched, orphans } = joinTallyAnswers({
      partners: [{ id: PARTNER_A, email: 'ada@acme.com' }],
      tallyAnswers: [{ email: 'grace@navy.mil', proofUrl: 'https://x.test' }],
    });

    expect(matched.size).toBe(0);
    expect(orphans).toEqual([
      { email: 'grace@navy.mil', proofUrl: 'https://x.test' },
    ]);
  });

  it('keeps the first row when two rows target the same partner', () => {
    const { matched } = joinTallyAnswers({
      partners: [{ id: PARTNER_A, email: 'ada@acme.com' }],
      tallyAnswers: [
        { partnerId: PARTNER_A, proofUrl: 'https://first.test' },
        { partnerId: PARTNER_A, proofUrl: 'https://second.test' },
      ],
    });

    expect(matched.get(PARTNER_A)?.proofUrl).toBe('https://first.test');
  });
});
