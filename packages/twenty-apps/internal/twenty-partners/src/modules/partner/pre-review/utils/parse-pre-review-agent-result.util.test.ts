import { describe, expect, it } from 'vitest';

import { parsePreReviewAgentResult } from './parse-pre-review-agent-result.util';

describe('parsePreReviewAgentResult', () => {
  it('splits the newline-separated lists into arrays', () => {
    expect(
      parsePreReviewAgentResult({
        verdict: 'STRONG',
        headline: 'Live Twenty instance with a real customer workflow.',
        evidence: 'Instance answers with the Twenty app shell\nGitHub repo ships a custom app',
        flags: '',
        needsHumanLook: 'LinkedIn profile — blocked to automated fetch: https://x',
      }),
    ).toEqual({
      verdict: 'STRONG',
      headline: 'Live Twenty instance with a real customer workflow.',
      evidence: [
        'Instance answers with the Twenty app shell',
        'GitHub repo ships a custom app',
      ],
      flags: [],
      needsHumanLook: [
        'LinkedIn profile — blocked to automated fetch: https://x',
      ],
    });
  });

  it('strips list bullets and blank lines', () => {
    const parsed = parsePreReviewAgentResult({
      verdict: 'WEAK',
      headline: 'Proof link is dead.',
      evidence: '- Proof URL returns 404\n\n* No Twenty mention on the site',
      flags: '- Dead proof link',
      needsHumanLook: '',
    });

    expect(parsed?.evidence).toEqual([
      'Proof URL returns 404',
      'No Twenty mention on the site',
    ]);
    expect(parsed?.flags).toEqual(['Dead proof link']);
  });

  it('rejects an unknown verdict', () => {
    expect(
      parsePreReviewAgentResult({
        verdict: 'MAYBE',
        headline: 'x',
        evidence: 'y',
        flags: '',
        needsHumanLook: '',
      }),
    ).toBeNull();
  });

  it('rejects a missing headline and a null result', () => {
    expect(
      parsePreReviewAgentResult({
        verdict: 'STRONG',
        headline: '   ',
        evidence: 'y',
        flags: '',
        needsHumanLook: '',
      }),
    ).toBeNull();
    expect(parsePreReviewAgentResult(null)).toBeNull();
  });
});
