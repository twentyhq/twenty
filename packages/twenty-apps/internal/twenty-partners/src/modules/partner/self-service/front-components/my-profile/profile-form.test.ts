import { describe, expect, it } from 'vitest';

import { toProfileForm, toSaveBody, type ProfilePayload } from './profile-form';

const emptyPayload: ProfilePayload = {
  id: 'partner-1',
  name: 'Nine Dots Ventures',
  profilePictureUrl: null,
  introduction: null,
  city: null,
  country: null,
  languagesSpoken: null,
  region: null,
  partnerScope: null,
  skills: null,
  typeOfTeam: null,
  availability: null,
  hourlyRate: null,
  projectBudgetMin: null,
  website: null,
  linkedin: null,
  calendarLink: null,
};

describe('toProfileForm', () => {
  it('carries region through', () => {
    expect(toProfileForm({ ...emptyPayload, region: ['EUROPE', 'MENA'] }).region).toEqual([
      'EUROPE',
      'MENA',
    ]);
  });

  it('defaults a null region to an empty array', () => {
    expect(toProfileForm(emptyPayload).region).toEqual([]);
  });
});

describe('toSaveBody', () => {
  it('sends region as an array', () => {
    const body = toSaveBody({ ...toProfileForm(emptyPayload), region: ['APAC'] });
    expect(body.region).toEqual(['APAC']);
  });

  it('sends an empty region array when nothing is selected', () => {
    expect(toSaveBody(toProfileForm(emptyPayload)).region).toEqual([]);
  });

  it('sends null for a blank country, not an empty string', () => {
    expect(toSaveBody(toProfileForm(emptyPayload)).country).toBeNull();
  });

  it('converts a money field to micros', () => {
    const form = toProfileForm({
      ...emptyPayload,
      hourlyRate: { amountMicros: 150000000, currencyCode: 'USD' },
    });
    expect(toSaveBody(form).hourlyRate).toEqual({ amountMicros: 150000000, currencyCode: 'USD' });
  });
});
