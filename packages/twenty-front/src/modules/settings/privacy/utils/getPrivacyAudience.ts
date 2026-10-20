import { isNonEmptyString } from '@sniptt/guards';

import { EU_PRIVACY_AUDIENCE_COUNTRY_CODES } from '@/settings/privacy/constants/EuPrivacyAudienceCountryCodes';
import { type PrivacyAudience } from '@/settings/privacy/types/PrivacyAudience';

export const getPrivacyAudience = (
  countryCode: string | null | undefined,
): PrivacyAudience =>
  isNonEmptyString(countryCode) &&
  EU_PRIVACY_AUDIENCE_COUNTRY_CODES.includes(countryCode.toLowerCase())
    ? 'eu'
    : 'global';
