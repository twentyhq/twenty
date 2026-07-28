import { describe, expect, it } from 'vitest';

import {
  buildRequirementsText,
  submitClientBriefSchema,
} from './mappers/build-requirements-text.mapper';

const base = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
  need: 'Migrate from HubSpot',
};

describe('buildRequirementsText', () => {
  it('returns null when no requirements or context fields', () => {
    expect(buildRequirementsText(base)).toBeNull();
  });

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

describe('submitClientBriefSchema partnerSlug', () => {
  it('accepts a well-formed slug', () => {
    expect(
      submitClientBriefSchema.safeParse({ ...base, partnerSlug: 'acme-consulting' }).success,
    ).toBe(true);
  });

  it('accepts a payload with no slug at all', () => {
    expect(submitClientBriefSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a slug with unsupported characters', () => {
    expect(
      submitClientBriefSchema.safeParse({ ...base, partnerSlug: 'Acme Consulting!' }).success,
    ).toBe(false);
  });

  it('keeps partnerSlug out of the requirements text', () => {
    const withoutSlug = buildRequirementsText({ ...base, requirements: 'French UI', seatCount: '~30' });
    const withSlug = buildRequirementsText({
      ...base,
      requirements: 'French UI',
      seatCount: '~30',
      partnerSlug: 'acme-consulting',
    });
    expect(withSlug).toBe(withoutSlug);
    expect(withSlug).not.toContain('acme-consulting');
  });
});
