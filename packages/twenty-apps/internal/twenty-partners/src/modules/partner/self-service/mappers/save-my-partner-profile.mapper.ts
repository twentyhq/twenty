import { type CoreSchema } from 'twenty-client-sdk/core';
import { z } from 'zod';

import { PROFILE_OPTIONS } from 'src/modules/partner/self-service/constants/my-profile.constants';
import { optionalHttpUrl } from 'src/modules/shared/utils/http-url.util';

const optionalUrl = optionalHttpUrl;

// Marketplace pricing is USD-only (the profile UI has no currency picker), so pin the
// code and reject negative/NaN amounts rather than accept arbitrary values via the API.
const optionalMoney = z
  .object({
    amountMicros: z.number().finite().nonnegative(),
    currencyCode: z.literal('USD'),
  })
  .nullable()
  .optional();

export const saveProfileSchema = z
  .object({
    name: z.string().trim().optional(),
    introduction: z.string().optional(),
    city: z.string().optional(),
    // null clears the field; the enum/country selectors send null when reset to blank.
    country: z.string().nullable().optional(),
    languagesSpoken: z.array(z.string()).optional(),
    partnerScope: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    typeOfTeam: z.enum(['SOLO', 'AGENCY']).nullable().optional(),
    availability: z.enum(['AVAILABLE', 'UNAVAILABLE']).nullable().optional(),
    hourlyRate: optionalMoney,
    projectBudgetMin: optionalMoney,
    website: optionalUrl,
    linkedin: optionalUrl,
    calendarLink: optionalUrl,
  })
  .strict();

export type SaveProfileInput = z.infer<typeof saveProfileSchema>;

const optionValueSet = (options: { value: string }[]): Set<string> =>
  new Set(options.map((option) => option.value));

const COUNTRY_VALUES = optionValueSet(PROFILE_OPTIONS.country);
const LANGUAGE_VALUES = optionValueSet(PROFILE_OPTIONS.languagesSpoken);
const PARTNER_SCOPE_VALUES = optionValueSet(PROFILE_OPTIONS.partnerScope);

// Kept separate from buildPartnerUpdateData so each concern (validation vs.
// mapping) is independently unit-testable.
export function validateProfileOptionValues(
  input: SaveProfileInput,
): { error: string } | null {
  if (input.country != null && !COUNTRY_VALUES.has(input.country)) {
    return { error: `Unknown country: ${input.country}` };
  }
  if (input.languagesSpoken !== undefined) {
    const unknown = input.languagesSpoken.find((value) => !LANGUAGE_VALUES.has(value));
    if (unknown !== undefined) return { error: `Unknown language: ${unknown}` };
  }
  if (input.partnerScope !== undefined) {
    const unknown = input.partnerScope.find((value) => !PARTNER_SCOPE_VALUES.has(value));
    if (unknown !== undefined) return { error: `Unknown partner scope: ${unknown}` };
  }
  return null;
}

// Pure mapper: assumes validateProfileOptionValues already accepted `input`.
// Only fields present on `input` are copied onto the update payload.
export function buildPartnerUpdateData(
  input: SaveProfileInput,
): CoreSchema.PartnerUpdateInput {
  const data: CoreSchema.PartnerUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.introduction !== undefined) data.introduction = input.introduction;
  if (input.city !== undefined) data.city = input.city;
  if (input.country !== undefined) {
    data.country =
      input.country === null ? null : (input.country as CoreSchema.PartnerCountryEnum);
  }
  if (input.languagesSpoken !== undefined) {
    data.languagesSpoken = input.languagesSpoken.map(
      (value) => value as CoreSchema.PartnerLanguagesSpokenEnum,
    );
  }
  if (input.partnerScope !== undefined) {
    data.partnerScope = input.partnerScope.map(
      (value) => value as CoreSchema.PartnerPartnerScopeEnum,
    );
  }
  if (input.skills !== undefined) data.skills = input.skills;
  if (input.typeOfTeam !== undefined) data.typeOfTeam = input.typeOfTeam;
  if (input.availability !== undefined) data.availability = input.availability;
  if (input.hourlyRate !== undefined) {
    data.hourlyRate = input.hourlyRate === null ? null : { ...input.hourlyRate };
  }
  if (input.projectBudgetMin !== undefined) {
    data.projectBudgetMin =
      input.projectBudgetMin === null ? null : { ...input.projectBudgetMin };
  }
  if (input.website !== undefined) {
    data.website = input.website === null ? null : { primaryLinkUrl: input.website };
  }
  if (input.linkedin !== undefined) {
    data.linkedin = input.linkedin === null ? null : { primaryLinkUrl: input.linkedin };
  }
  if (input.calendarLink !== undefined) {
    data.calendarLink =
      input.calendarLink === null ? null : { primaryLinkUrl: input.calendarLink };
  }

  return data;
}
