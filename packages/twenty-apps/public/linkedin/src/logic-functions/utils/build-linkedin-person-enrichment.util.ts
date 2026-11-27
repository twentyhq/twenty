import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileUserProfile } from 'src/unipile/types/unipile-user-profile.type';

export type LinkedinPersonEnrichment = {
  jobTitle?: string;
  city?: string;
  xLinkUrl?: string;
  email?: string;
};

export const buildLinkedinPersonEnrichment = (
  profile: UnipileUserProfile,
): LinkedinPersonEnrichment => {
  const currentJobTitle = profile.specifics?.experience
    ?.find((experience) => !isNonEmptyString(experience.ended_on))
    ?.job_title?.trim();
  // LinkedIn locations read "City, Region, Country"
  const city = profile.location?.split(',')[0]?.trim();
  const email = profile.emails?.find(isNonEmptyString)?.trim();
  const xLinkUrl = profile.social_handles?.x?.url?.trim();

  return {
    ...(isNonEmptyString(currentJobTitle) ? { jobTitle: currentJobTitle } : {}),
    ...(isNonEmptyString(city) ? { city } : {}),
    ...(isNonEmptyString(xLinkUrl) ? { xLinkUrl } : {}),
    ...(isNonEmptyString(email) ? { email: email.toLowerCase() } : {}),
  };
};
