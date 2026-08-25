import { describe, expect, it } from 'vitest';

import { applyVerdictCap } from './apply-verdict-cap.util';

describe('applyVerdictCap', () => {
  it('caps STRONG at WORTH_A_LOOK when nothing was verified', () => {
    expect(
      applyVerdictCap({ verdict: 'STRONG', hasVerifiableProof: false }),
    ).toBe('WORTH_A_LOOK');
  });

  it('keeps STRONG when proof was verified', () => {
    expect(
      applyVerdictCap({ verdict: 'STRONG', hasVerifiableProof: true }),
    ).toBe('STRONG');
  });

  it('never lifts a verdict that is already at or below the cap', () => {
    expect(applyVerdictCap({ verdict: 'WEAK', hasVerifiableProof: false })).toBe(
      'WEAK',
    );
    expect(applyVerdictCap({ verdict: 'SPAM', hasVerifiableProof: false })).toBe(
      'SPAM',
    );
    expect(
      applyVerdictCap({ verdict: 'WORTH_A_LOOK', hasVerifiableProof: false }),
    ).toBe('WORTH_A_LOOK');
  });
});
