import { describe, expect, it } from 'vitest';

import { deriveTaxType } from '../derive-tax-type';

describe('deriveTaxType', () => {
  it('returns INTRA_STATE when seller state matches place of supply', () => {
    expect(deriveTaxType('Tamil Nadu', 'Tamil Nadu')).toBe('INTRA_STATE');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(deriveTaxType(' tamil nadu ', 'Tamil Nadu')).toBe('INTRA_STATE');
  });

  it('returns INTER_STATE when seller state differs from place of supply', () => {
    expect(deriveTaxType('Tamil Nadu', 'Karnataka')).toBe('INTER_STATE');
  });

  it('returns null when either field is missing', () => {
    expect(deriveTaxType(null, 'Karnataka')).toBeNull();
    expect(deriveTaxType('Tamil Nadu', undefined)).toBeNull();
  });
});
