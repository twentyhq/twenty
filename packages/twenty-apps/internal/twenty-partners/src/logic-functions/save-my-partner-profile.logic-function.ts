import { type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { PROFILE_OPTIONS } from 'src/constants/my-profile.constants';

import { optionalHttpUrl } from './http-url';
import { buildAppClient, errorResponse, failureResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const SAVE_MY_PARTNER_PROFILE_ID = 'de21e2a6-f4b4-4186-90d9-645015e856a1';

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

export type SaveResult = { ok: true } | { ok: false; reason: string };

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

export const handler = async (event: RoutePayload<unknown>): Promise<SaveResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = saveProfileSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }
  const input = parsed.data;

  const optionError = validateProfileOptionValues(input);
  if (optionError) return errorResponse(optionError.error);

  const data = buildPartnerUpdateData(input);

  try {
    const client = buildAppClient();
    await client.mutation({
      updatePartner: { __args: { id: resolved.partnerId, data }, id: true },
    });
    return { ok: true };
  } catch (err) {
    return failureResponse('save-my-partner-profile', err);
  }
};

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_PROFILE_ID,
  name: 'save-my-partner-profile',
  description: "Saves the calling partner's own editable profile fields.",
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-profile',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
