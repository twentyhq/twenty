import { describe, expect, it } from 'vitest';

import { buildRequirementsText } from '../submit-client-brief.logic-function';

const base = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
  need: 'Migrate from HubSpot',
};

describe('buildRequirementsText', () => {
  it('returns only base requirements when no context', () => {
    expect(buildRequirementsText({ ...base, requirements: 'Must go live Q4' })).toBe(
      'Must go live Q4',
    );
  });

  it('appends additional context block when context fields present', () => {
    const text = buildRequirementsText({
      ...base,
      requirements: 'French UI',
      hostingType: 'CLOUD',
      seatCount: '~30',
      country: 'France',
    });
    expect(text).toContain('French UI');
    expect(text).toContain('Additional context:');
    expect(text).toContain('• Hosting: Cloud');
    expect(text).toContain('• Seats: ~30');
    expect(text).toContain('• Country: France');
  });

  it('omits empty context bullets', () => {
    const text = buildRequirementsText({ ...base, hostingType: 'SELF_HOSTING' });
    expect(text).toContain('• Hosting: Self-hosting');
    expect(text).not.toContain('• Seats:');
  });
});
