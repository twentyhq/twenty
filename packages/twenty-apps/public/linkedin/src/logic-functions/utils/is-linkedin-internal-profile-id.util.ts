const LINKEDIN_INTERNAL_PROFILE_ID_PATTERN = /^ac[ow]aa/i;

export const isLinkedinInternalProfileId = (profileIdentifier: string) =>
  LINKEDIN_INTERNAL_PROFILE_ID_PATTERN.test(profileIdentifier);
