import { describe, expect, it } from 'vitest';

import { submitPartnerApplicationSchema } from '../submit-partner-application.logic-function';

const base = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  companyName: 'Analytical Engines',
};

describe('submitPartnerApplicationSchema', () => {
  it('accepts a minimal valid application', () => {
    expect(submitPartnerApplicationSchema.safeParse(base).success).toBe(true);
  });

  it('accepts the new partnerScope categories', () => {
    const result = submitPartnerApplicationSchema.safeParse({
      ...base,
      partnerScope: ['ADVISORY', 'SOLUTIONING', 'HOSTING'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects legacy / unknown partnerScope values', () => {
    expect(
      submitPartnerApplicationSchema.safeParse({ ...base, partnerScope: ['APPS'] })
        .success,
    ).toBe(false);
  });

  it('rejects an unknown typeOfTeam', () => {
    expect(
      submitPartnerApplicationSchema.safeParse({ ...base, typeOfTeam: 'FREELANCE' })
        .success,
    ).toBe(false);
  });

  it('rejects an unknown country but accepts a known one with languages', () => {
    expect(
      submitPartnerApplicationSchema.safeParse({ ...base, country: 'ATLANTIS' })
        .success,
    ).toBe(false);
    expect(
      submitPartnerApplicationSchema.safeParse({
        ...base,
        country: 'FRANCE',
        languages: ['ENGLISH', 'FRENCH'],
      }).success,
    ).toBe(true);
  });

  it('requires a non-empty email and companyName', () => {
    expect(
      submitPartnerApplicationSchema.safeParse({ ...base, email: '' }).success,
    ).toBe(false);
    expect(
      submitPartnerApplicationSchema.safeParse({ ...base, companyName: '' })
        .success,
    ).toBe(false);
  });

  it('accepts optional notes and commercials', () => {
    const result = submitPartnerApplicationSchema.safeParse({
      ...base,
      applicationNotes: 'Looking forward to partnering.',
      hourlyRate: 150,
      projectBudgetMin: 5000,
      skills: ['React', 'PostgreSQL'],
    });
    expect(result.success).toBe(true);
  });
});
