import { type CoreSchema } from 'twenty-client-sdk/core';

import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { deriveDeploymentExpertise } from 'src/modules/partner/application-intake/utils/derive-deployment-expertise';
import { deriveRegion } from 'src/modules/partner/application-intake/utils/derive-region';
import { type SubmitPartnerApplicationInput } from 'src/modules/partner/application-intake/services/submit-partner-application-input.schema';
import { slugify } from 'src/scripts/slugify';

function toMicros(usd: number | undefined): { amountMicros: number; currencyCode: 'USD' } | undefined {
  if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < 0) return undefined;
  return { amountMicros: Math.round(usd * 1_000_000), currencyCode: 'USD' };
}

function buildApplicationNotes(input: SubmitPartnerApplicationInput): string | null {
  return isNonEmptyString(input.applicationNotes) ? input.applicationNotes.trim() : null;
}

// Mirrors the subset of Partner{Create,Update}Input this handler writes. The
// enum-typed columns are narrowed from the validated string inputs below.
export type PartnerFieldsForUpsert = {
  name: string;
  linkedin?: { primaryLinkUrl: string };
  website?: { primaryLinkUrl: string };
  city?: string;
  country?: CoreSchema.PartnerCountryEnum;
  languagesSpoken?: CoreSchema.PartnerLanguagesSpokenEnum[];
  typeOfTeam?: CoreSchema.PartnerTypeOfTeamEnum;
  partnerScope?: CoreSchema.PartnerPartnerScopeEnum[];
  skills?: string[];
  hourlyRate?: { amountMicros: number; currencyCode: 'USD' };
  projectBudgetMin?: { amountMicros: number; currencyCode: 'USD' };
  calendarLink?: { primaryLinkUrl: string };
  applicationNotes?: string | null;
  twentyExperience?: CoreSchema.PartnerTwentyExperienceEnum[];
  twentyExperienceNotes?: string;
  twentyExperienceProofLink?: { primaryLinkUrl: string };
};

export function buildPartnerFields(input: SubmitPartnerApplicationInput): PartnerFieldsForUpsert {
  const fields: PartnerFieldsForUpsert = {
    name: input.companyName.trim(),
  };
  if (isNonEmptyString(input.linkedin)) fields.linkedin = { primaryLinkUrl: input.linkedin.trim() };
  if (isNonEmptyString(input.domainName)) fields.website = { primaryLinkUrl: input.domainName.trim() };
  if (isNonEmptyString(input.city)) fields.city = input.city.trim();
  // validate() has already checked these against the allowed value sets, so
  // narrowing the validated strings to their enum types here is sound.
  if (input.country !== undefined) fields.country = input.country as CoreSchema.PartnerCountryEnum;
  if (input.languages !== undefined && input.languages.length > 0)
    fields.languagesSpoken = input.languages as CoreSchema.PartnerLanguagesSpokenEnum[];
  if (input.typeOfTeam !== undefined) fields.typeOfTeam = input.typeOfTeam as CoreSchema.PartnerTypeOfTeamEnum;
  if (input.partnerScope !== undefined && input.partnerScope.length > 0)
    fields.partnerScope = input.partnerScope as CoreSchema.PartnerPartnerScopeEnum[];
  if (input.skills !== undefined && input.skills.length > 0) fields.skills = input.skills.filter(isNonEmptyString);
  const hourly = toMicros(input.hourlyRate);
  if (hourly) fields.hourlyRate = hourly;
  const min = toMicros(input.projectBudgetMin);
  if (min) fields.projectBudgetMin = min;
  if (isNonEmptyString(input.calendarLink)) fields.calendarLink = { primaryLinkUrl: input.calendarLink.trim() };
  const notes = buildApplicationNotes(input);
  if (notes !== null) fields.applicationNotes = notes;
  if (input.twentyExperience !== undefined && input.twentyExperience.length > 0) {
    fields.twentyExperience =
      input.twentyExperience as CoreSchema.PartnerTwentyExperienceEnum[];
  }
  if (isNonEmptyString(input.twentyExperienceNotes)) {
    fields.twentyExperienceNotes = input.twentyExperienceNotes.trim();
  }
  if (isNonEmptyString(input.twentyExperienceProofLink)) {
    fields.twentyExperienceProofLink = {
      primaryLinkUrl: input.twentyExperienceProofLink.trim(),
    };
  }
  return fields;
}

export function buildPartnerCreateData(
  partnerFields: PartnerFieldsForUpsert,
  input: SubmitPartnerApplicationInput,
  companyId: string,
): CoreSchema.PartnerCreateInput {
  const region = deriveRegion(input.country);
  return {
    ...partnerFields,
    slug: slugify(input.companyName),
    validationStage: 'APPLICATION',
    reviewed: false,
    partnerTier: 'NEW',
    companyId,
    deploymentExpertise: deriveDeploymentExpertise(input.partnerScope) as CoreSchema.PartnerDeploymentExpertiseEnum[],
    ...(region ? { region: [region] as CoreSchema.PartnerRegionEnum[] } : {}),
  };
}
