import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileUserProfile } from 'src/unipile/types/unipile-user-profile.type';

export type LinkedinPersonEnrichment = {
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
};

export const buildLinkedinPersonEnrichment = (
  profile: UnipileUserProfile,
): LinkedinPersonEnrichment => {
  const jobTitle = profile.specifics?.experience
    ?.find((experience) => !isNonEmptyString(experience.ended_on))
    ?.job_title?.trim();
  const email = profile.emails?.find(isNonEmptyString)?.trim().toLowerCase();
  const phoneNumber = profile.phone_numbers?.find(isNonEmptyString)?.trim();

  return {
    ...(isNonEmptyString(jobTitle) ? { jobTitle } : {}),
    ...(isNonEmptyString(email) ? { email } : {}),
    ...(isNonEmptyString(phoneNumber) ? { phoneNumber } : {}),
  };
};
