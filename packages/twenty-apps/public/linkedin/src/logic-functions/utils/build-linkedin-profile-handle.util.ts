import { isNonEmptyString } from '@sniptt/guards';

import { LINKEDIN_PROFILE_BASE_URL } from 'src/constants/linkedin-profile-base-url.constant';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const buildLinkedinProfileHandle = (
  user: Pick<UnipileUser, 'id' | 'public_identifier' | 'profile_url'>,
): string => {
  if (isNonEmptyString(user.public_identifier)) {
    return `${LINKEDIN_PROFILE_BASE_URL}${user.public_identifier}`;
  }

  if (isNonEmptyString(user.profile_url)) {
    return user.profile_url;
  }

  return `${LINKEDIN_PROFILE_BASE_URL}${user.id}`;
};
