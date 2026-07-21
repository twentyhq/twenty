import { describe, expect, it } from 'vitest';

import {
  buildPartnerUpdateData,
  saveProfileSchema,
  validateProfileOptionValues,
} from './save-my-partner-profile.logic-function';

describe('saveProfileSchema', () => {
  it('accepts a valid partial payload', () => {
    const parsed = saveProfileSchema.safeParse({ name: 'Nine Dots Ventures', city: 'Paris' });
    expect(parsed.success).toBe(true);
  });

  it('accepts an empty payload', () => {
    expect(saveProfileSchema.safeParse({}).success).toBe(true);
  });

  it('rejects an unknown key (region)', () => {
    const parsed = saveProfileSchema.safeParse({ region: ['EUROPE'] });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown key (validationStage)', () => {
    const parsed = saveProfileSchema.safeParse({ validationStage: 'VALIDATED' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a malformed url', () => {
    const parsed = saveProfileSchema.safeParse({ website: 'not-a-url' });
    expect(parsed.success).toBe(false);
  });

  it('accepts a null url (clearing the field)', () => {
    const parsed = saveProfileSchema.safeParse({ website: null });
    expect(parsed.success).toBe(true);
  });

  it('treats an empty-string url as cleared (null), not a validation error', () => {
    const parsed = saveProfileSchema.safeParse({ website: '' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.website).toBeNull();
  });

  it('rejects a typeOfTeam value outside the known enum', () => {
    const parsed = saveProfileSchema.safeParse({ typeOfTeam: 'FREELANCER' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a negative hourlyRate amount', () => {
    expect(
      saveProfileSchema.safeParse({ hourlyRate: { amountMicros: -1, currencyCode: 'USD' } }).success,
    ).toBe(false);
  });

  it('rejects a non-ISO currency code', () => {
    expect(
      saveProfileSchema.safeParse({ hourlyRate: { amountMicros: 100, currencyCode: 'DOLLARS' } })
        .success,
    ).toBe(false);
  });

  it('rejects a lowercase currency code (USD only)', () => {
    expect(
      saveProfileSchema.safeParse({ hourlyRate: { amountMicros: 100, currencyCode: 'usd' } })
        .success,
    ).toBe(false);
  });

  it('accepts null for clearable country and enum fields', () => {
    expect(
      saveProfileSchema.safeParse({ country: null, typeOfTeam: null, availability: null }).success,
    ).toBe(true);
  });
});

describe('validateProfileOptionValues', () => {
  it('rejects an unknown country', () => {
    const result = validateProfileOptionValues({ country: 'NOPE' });
    expect(result).toEqual({ error: 'Unknown country: NOPE' });
  });

  it('accepts a known country', () => {
    expect(validateProfileOptionValues({ country: 'FRANCE' })).toBeNull();
  });

  it('rejects an unknown language', () => {
    const result = validateProfileOptionValues({ languagesSpoken: ['ENGLISH', 'KLINGON'] });
    expect(result).toEqual({ error: 'Unknown language: KLINGON' });
  });

  it('rejects an unknown partner scope', () => {
    const result = validateProfileOptionValues({ partnerScope: ['NOT_A_SCOPE'] });
    expect(result?.error).toContain('NOT_A_SCOPE');
  });

  it('returns null when nothing to validate is present', () => {
    expect(validateProfileOptionValues({})).toBeNull();
  });

  it('accepts a null country (clearing it)', () => {
    expect(validateProfileOptionValues({ country: null })).toBeNull();
  });
});

describe('buildPartnerUpdateData', () => {
  it('maps only the keys present on the input', () => {
    const data = buildPartnerUpdateData({ name: 'Nine Dots Ventures' });
    expect(data).toEqual({ name: 'Nine Dots Ventures' });
  });

  it('wraps LINKS fields to { primaryLinkUrl }', () => {
    const data = buildPartnerUpdateData({
      website: 'https://ninedots.example.com',
      linkedin: 'https://linkedin.com/company/nine-dots',
      calendarLink: 'https://cal.example.com/nine-dots',
    });

    expect(data.website).toEqual({ primaryLinkUrl: 'https://ninedots.example.com' });
    expect(data.linkedin).toEqual({ primaryLinkUrl: 'https://linkedin.com/company/nine-dots' });
    expect(data.calendarLink).toEqual({ primaryLinkUrl: 'https://cal.example.com/nine-dots' });
  });

  it('maps a null LINKS field to null (clearing it)', () => {
    const data = buildPartnerUpdateData({ website: null });
    expect(data.website).toBeNull();
  });

  it('passes CURRENCY fields through as { amountMicros, currencyCode }', () => {
    const data = buildPartnerUpdateData({
      hourlyRate: { amountMicros: 150000000, currencyCode: 'USD' },
      projectBudgetMin: { amountMicros: 1000000000, currencyCode: 'USD' },
    });

    expect(data.hourlyRate).toEqual({ amountMicros: 150000000, currencyCode: 'USD' });
    expect(data.projectBudgetMin).toEqual({ amountMicros: 1000000000, currencyCode: 'USD' });
  });

  it('maps a null CURRENCY field to null (clearing it)', () => {
    const data = buildPartnerUpdateData({ hourlyRate: null });
    expect(data.hourlyRate).toBeNull();
  });

  it('keeps enum and array values as provided', () => {
    const data = buildPartnerUpdateData({
      country: 'FRANCE',
      languagesSpoken: ['ENGLISH', 'FRENCH'],
      partnerScope: ['ADVISORY'],
      typeOfTeam: 'AGENCY',
      availability: 'AVAILABLE',
      skills: ['Salesforce'],
    });

    expect(data.country).toBe('FRANCE');
    expect(data.languagesSpoken).toEqual(['ENGLISH', 'FRENCH']);
    expect(data.partnerScope).toEqual(['ADVISORY']);
    expect(data.typeOfTeam).toBe('AGENCY');
    expect(data.availability).toBe('AVAILABLE');
    expect(data.skills).toEqual(['Salesforce']);
  });

  it('maps a null country to null (clearing it)', () => {
    expect(buildPartnerUpdateData({ country: null }).country).toBeNull();
  });

  it('returns an empty object for an empty input', () => {
    expect(buildPartnerUpdateData({})).toEqual({});
  });
});
